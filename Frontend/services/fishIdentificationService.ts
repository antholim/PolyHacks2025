import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { YOUR_API_KEY, YOUR_SECRET_API_KEY } from '../envVariables';

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
 * Save a history record to AsyncStorage.
 */
const saveToHistory = async (imageUri: string, species: string) => {
  try {
    const historyItem = {
      id: Date.now().toString(),
      imageUri,
      species,
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
 * Identify fish from a photo URI by performing:
 * 1. Authentication
 * 2. Image upload (to obtain a signed-id)
 * 3. Fish recognition using the signed-id
 */
export const identifyFish = async (imageUri: string) => {
  try {
    // ─── STEP 1: Authenticate ────────────────────────────────────────────── Good
    const authResponse = await axios.post(
      'https://api-users.fishial.ai/v1/auth/token',
      {
        client_id: YOUR_API_KEY,
        client_secret: YOUR_SECRET_API_KEY,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const token = authResponse.data.access_token;

    // ─── STEP 2: Upload the Image ───────────────────────────────────────────
    // Fetch the image from the provided URI as an array buffer.
    const imageResponse = await axios.get(imageUri, { responseType: 'arraybuffer' });
    const imageBuffer: ArrayBuffer = imageResponse.data;
    const byteSize = imageBuffer.byteLength;

    // Compute the MD5 checksum in Base64.
    const wordArray = arrayBufferToWordArray(imageBuffer);
    const checksum = CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Base64);

    // Derive filename from the image URI (assumes the URI ends with the file name).
    const parts = imageUri.split('/');
    const filename = parts[parts.length - 1];
    const contentType = "image/jpeg"; // Adjust if your image is of a different type.

    // Prepare metadata required by the upload endpoint.
    const metadata = {
      blob: {
        filename: filename,
        content_type: contentType,
        byte_size: byteSize,
        checksum: checksum,
      }
    };

    // Request a signed upload URL.
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
    console.log(imageResponse)
    console.log(imageUri)
    console.log(metadata)
    console.log(uploadResponse)

    // Extract the signed-id and the direct-upload details.
    const signedId = uploadResponse.data['signed-id'];
    const directUpload = uploadResponse.data['direct-upload'];
    const uploadUrl = directUpload.url;
    const uploadHeaders = directUpload.headers;
    // console.log("Signed ID:", signedId);
    // console.log("Direct Upload URL:", uploadUrl);
    // console.log("Upload Headers:", uploadHeaders);

    // Upload the image data to the signed URL via PUT.
    console.log(uploadUrl)
    console.log(imageBuffer)
    console.log(uploadHeaders)
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        ...uploadHeaders,
        // Do not set Content-Type header at all
        'Content-Type': '',
        // Make sure Content-MD5 and Content-Disposition are exactly as provided
        'Content-MD5': uploadHeaders['Content-MD5'],
        'Content-Disposition': uploadHeaders['Content-Disposition']
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      transformRequest: [(data) => {
        // Return the raw image data without any transformation
        return data;
      }]
    })
    // await axios.put(uploadUrl, imageBuffer, {
    //   headers: uploadHeaders,
    //   maxContentLength: Infinity,
    //   maxBodyLength: Infinity,
    // });
    // console.log("Image uploaded successfully.");

    // ─── STEP 3: Fish Recognition ──────────────────────────────────────────
    // Use the signed-id as a query parameter to request fish recognition.
    const recognitionResponse = await axios.get(
      `https://api.fishial.ai/v1/recognition/image?q=${encodeURIComponent(signedId)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const recognitionResult = recognitionResponse.data;
    const mostAccurateSpecies = recognitionResult.results[0].species[0];
    console.log(mostAccurateSpecies)

    console.log(JSON.stringify(recognitionResult))
    // console.log("Fish Recognition Result:", recognitionResult);


    // Save the result to history.
    await saveToHistory(imageUri, mostAccurateSpecies);

    // Return the recognition result.
    return mostAccurateSpecies;
  } catch (error: any) {
    console.error("Error in identifyFish:", error.response?.data || error.message);
    throw error;
  }
};
