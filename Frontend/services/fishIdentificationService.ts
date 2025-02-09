import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { YOUR_API_KEY, YOUR_SECRET_API_KEY } from '../envVariables';

// Common name mappings for frequently encountered species
const FISH_COMMON_NAMES: { [key: string]: string } = {
  "Salmo trutta": "Brown Trout",
  "Esox lucius": "Northern Pike",
  "Esox masquinongy": "Muskellunge",
  "Salvelinus fontinalis": "Brook Trout",
  "Sander vitreus": "Walleye",
  "Micropterus salmoides": "Largemouth Bass",
  "Micropterus dolomieu": "Smallmouth Bass",
  "Oncorhynchus mykiss": "Rainbow Trout",
  "Perca flavescens": "Yellow Perch",
  "Pomoxis nigromaculatus": "Black Crappie",
  "Lepomis macrochirus": "Bluegill",
  "Ictalurus punctatus": "Channel Catfish",
  "Pylodictis olivaris": "Flathead Catfish",
  "Morone chrysops": "White Bass",
  "Cyprinus carpio": "Common Carp"
};

/**
 * Helper: Convert an ArrayBuffer to a CryptoJS WordArray.
 * This is needed because CryptoJS expects a WordArray for binary data.
 */
function arrayBufferToWordArray(ab: ArrayBuffer): CryptoJS.lib.WordArray {
  const u8 = new Uint8Array(ab);
  const len = u8.length;
  const words: number[] = [];
  for (let i = 0; i < len; i += 4) {
    words.push(
      (u8[i] << 24) |
      (u8[i + 1] << 16) |
      (u8[i + 2] << 8) |
      (u8[i + 3])
    );
  }
  return CryptoJS.lib.WordArray.create(words, len);
}

/**
 * Interface for fish species information
 */
interface FishSpecies {
  scientificName: string;
  commonName: string | null;
  accuracy: number;
}

/**
 * Interface for the history item structure
 */
interface HistoryItem {
  id: string;
  imageUri: string;
  scientificName: string;
  commonName: string | null;
  accuracy: number;
  date: string;
}

/**
 * Interface for the recognition response
 */
interface RecognitionResponse {
  results: [{
    shape: any;
    species: Array<{
      name: string;
      accuracy: number;
      'fishangler-id': string;
      'fishangler-data': any;
    }>;
  }];
}

/**
 * Interface for upload metadata
 */
interface UploadMetadata {
  blob: {
    filename: string;
    content_type: string;
    byte_size: number;
    checksum: string;
  };
}

/**
 * Get common name for a scientific name using our mapping or API data
 */
const getCommonName = (scientificName: string, fishanglerData: any): string | null => {
  // Try to get the common name from the API response first
  if (fishanglerData && fishanglerData.common_name) {
    return fishanglerData.common_name;
  }
  
  // Fall back to our local mapping
  return FISH_COMMON_NAMES[scientificName] || null;
};

/**
 * Save a history record to AsyncStorage.
 */
const saveToHistory = async (imageUri: string, fishInfo: FishSpecies) => {
  try {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      imageUri,
      scientificName: fishInfo.scientificName,
      commonName: fishInfo.commonName,
      accuracy: fishInfo.accuracy,
      date: new Date().toISOString(),
    };

    const existingHistory = await AsyncStorage.getItem("fishHistory");
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(historyItem);

    // Keep only the 50 most recent items
    await AsyncStorage.setItem("fishHistory", JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    console.error("Error saving to history:", error);
  }
};

/**
 * Main function to identify fish from a photo URI
 */
export const identifyFish = async (imageUri: string): Promise<FishSpecies> => {
  try {
    // ─── STEP 1: Authenticate ─────────────────────────────────────────────
    const authResponse = await axios.post(
      'https://api-users.fishial.ai/v1/auth/token',
      {
        client_id: YOUR_API_KEY,
        client_secret: YOUR_SECRET_API_KEY,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const token = authResponse.data.access_token;
    console.log("Authentication successful");

    // ─── STEP 2: Upload the Image ───────────────────────────────────────────
    // Fetch the image from the provided URI as an array buffer
    const imageResponse = await axios.get(imageUri, { responseType: 'arraybuffer' });
    const imageBuffer: ArrayBuffer = imageResponse.data;
    const byteSize = imageBuffer.byteLength;

    // Compute the MD5 checksum in Base64
    const wordArray = arrayBufferToWordArray(imageBuffer);
    const checksum = CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Base64);

    // Derive filename from the image URI
    const parts = imageUri.split('/');
    const filename = parts[parts.length - 1];
    const contentType = "image/jpeg"; // Adjust if your image is of a different type

    // Prepare metadata for upload
    const metadata: UploadMetadata = {
      blob: {
        filename: filename,
        content_type: contentType,
        byte_size: byteSize,
        checksum: checksum,
      }
    };

    // Request a signed upload URL
    const uploadResponse = await axios.post(
      'https://api.fishial.ai/v1/recognition/upload',
      metadata,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract upload details
    const signedId = uploadResponse.data['signed-id'];
    const directUpload = uploadResponse.data['direct-upload'];
    const uploadUrl = directUpload.url;
    const uploadHeaders = directUpload.headers;

    console.log("Upload preparation successful");
    console.log("Signed ID:", signedId);

    // Upload the image data
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        ...uploadHeaders,
        'Content-Type': '',
        'Content-MD5': uploadHeaders['Content-MD5'],
        'Content-Disposition': uploadHeaders['Content-Disposition']
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      transformRequest: [(data) => data]
    });

    console.log("Image upload successful");

    // ─── STEP 3: Fish Recognition ──────────────────────────────────────────
    const recognitionResponse = await axios.get<RecognitionResponse>(
      `https://api.fishial.ai/v1/recognition/image?q=${encodeURIComponent(signedId)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    // Log full recognition result for debugging
    console.log("Full recognition result:", recognitionResponse.data);

    // Get the most accurate species
    const mostAccurateSpecies = recognitionResponse.data.results[0].species[0];
    const scientificName = mostAccurateSpecies.name;
    const commonName = getCommonName(scientificName, mostAccurateSpecies['fishangler-data']);

    const fishInfo: FishSpecies = {
      scientificName,
      commonName,
      accuracy: mostAccurateSpecies.accuracy
    };

    // Log the identified fish information
    console.log("Identified Fish:", {
      "Scientific Name": fishInfo.scientificName,
      "Common Name": fishInfo.commonName || "Not available",
      "Accuracy": `${(fishInfo.accuracy * 100).toFixed(1)}%`
    });

    // Log all species with their names and accuracies
    recognitionResponse.data.results[0].species.forEach(species => {
      const commonName = getCommonName(species.name, species['fishangler-data']);
      console.log(
        `Species: ${species.name} ${commonName ? `(${commonName})` : ''}, ` +
        `Accuracy: ${(species.accuracy * 100).toFixed(1)}%`
      );
    });

    // Save to history
    await saveToHistory(imageUri, fishInfo);

    return fishInfo;
  } catch (error: any) {
    console.error("Error in identifyFish:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get the fish identification history
 */
export const getFishHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyString = await AsyncStorage.getItem("fishHistory");
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

/**
 * Clear the fish identification history
 */
export const clearFishHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("fishHistory", JSON.stringify([]));
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};