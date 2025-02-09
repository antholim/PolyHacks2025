import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { identifyFish } from "../services/fishIdentificationService"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useZone } from '../context/ZoneContext'
import { Linking } from "react-native"


// Fish name mappings for species identification
const FISH_COMMON_NAMES: { [key: string]: string } = {
  "Salvelinus fontinalis": "Brook Trout",
  "Sander vitreus": "Walleye",
  "Esox lucius": "Northern Pike",
  "Salmo salar": "Atlantic Salmon",
  "Salvelinus namaycush": "Lake Trout",
  "Salmo salar sebago": "Landlocked Salmon",
  "Salvelinus alpinus": "Arctic Char",
  "Esox masquinongy": "Muskellunge",
  "Micropterus dolomieu": "Smallmouth Bass",
  "Micropterus salmoides": "Largemouth Bass",
  "Perca flavescens": "Yellow Perch",
  "Acipenser fulvescens": "Lake Sturgeon",
  "Pomoxis nigromaculatus": "Black Crappie",
  "Lepomis macrochirus": "Bluegill",
  "Ictalurus punctatus": "Channel Catfish",
  "Pylodictis olivaris": "Flathead Catfish",
  "Morone chrysops": "White Bass",
  "Cyprinus carpio": "Common Carp",
  "Oncorhynchus mykiss": "Rainbow Trout",
  "Salmo trutta": "Brown Trout",
  "Coregonus clupeaformis": "Lake Whitefish",
  "Alosa sapidissima": "American Shad",
  "Osmerus mordax": "Rainbow Smelt",
  "Lota lota": "Burbot",
  "Ameiurus nebulosus": "Brown Bullhead",
  "Morone saxatilis": "Striped Bass",
  "Anguilla rostrata": "American Eel",
  "Gadus morhua": "Atlantic Cod",
  "Clupea harengus": "Atlantic Herring",
  "Scomber scombrus": "Atlantic Mackerel",
  "Fundulus diaphanus": "Banded Killifish",
  "Carassius auratus": "Goldfish",
  "Moxostoma anisurum": "Silver Redhorse",
  "Moxostoma macrolepidotum": "Shorthead Redhorse",
  "Catostomus commersonii": "White Sucker",
  "Hypophthalmichthys molitrix": "Silver Carp",
  "Hypophthalmichthys nobilis": "Bighead Carp",
  "Morone americana": "White Perch",
  "Sciaenops ocellatus": "Red Drum",
  "Pogonias cromis": "Black Drum",
  "Cynoscion nebulosus": "Spotted Seatrout",
  "Cynoscion regalis": "Weakfish",
  "Thunnus albacares": "Yellowfin Tuna",
  "Thunnus thynnus": "Atlantic Bluefin Tuna",
  "Makaira nigricans": "Blue Marlin",
  "Xiphias gladius": "Swordfish",
  "Paralichthys dentatus": "Summer Flounder",
  "Paralichthys lethostigma": "Southern Flounder",
  "Hippoglossus hippoglossus": "Atlantic Halibut",
  "Hippoglossus stenolepis": "Pacific Halibut",
  "Melanogrammus aeglefinus": "Haddock",
  "Pollachius virens": "Pollock",
  "Sebastes marinus": "Acadian Redfish",
  "Sebastes ruberrimus": "Yelloweye Rockfish",
  "Lepomis gibbosus": "Pumpkinseed Sunfish",
  "Aplodinotus grunniens": "Freshwater Drum",
  "Cichla ocellaris": "Peacock Bass",
  "Amia calva": "Bowfin",
  "Lepisosteus osseus": "Longnose Gar",
  "Lepisosteus platostomus": "Shortnose Gar",
  "Lepisosteus oculatus": "Spotted Gar",
  "Atractosteus spatula": "Alligator Gar",
  "Alosa pseudoharengus": "Alewife",
  "Dorosoma cepedianum": "Gizzard Shad",
  "Oncorhynchus tshawytscha": "Chinook Salmon",
  "Oncorhynchus kisutch": "Coho Salmon",
  "Acipenser oxyrinchus": "Atlantic Sturgeon",
  "Pomoxis annularis": "White Crappie",
  "Ameiurus melas": "Black Bullhead",
  "Ameiurus natalis": "Yellow Bullhead",
  "Notemigonus crysoleucas": "Golden Shiner",
  "Notropis hudsonius": "Spottail Shiner",
  "Semotilus atromaculatus": "Creek Chub",
  "Rhinichthys atratulus": "Blacknose Dace",
  "Rhinichthys cataractae": "Longnose Dace",
  "Etheostoma olmstedi": "Tessellated Darter",
  "Percina caprodes": "Logperch",
  "Umbra limi": "Central Mudminnow",
  "Pimephales notatus": "Bluntnose Minnow",
  "Notropis atherinoides": "Emerald Shiner",
  "Notropis rubellus": "Rosyface Shiner",
  "Notropis volucellus": "Mimic Shiner",
  "Cyprinella spiloptera": "Spotfin Shiner",
  "Hybognathus regius": "Eastern Silvery Minnow",
  "Pimephales promelas": "Fathead Minnow",
  "Luxilus cornutus": "Common Shiner",
  "Semotilus corporalis": "Fallfish",
  "Margariscus margarita": "Pearl Dace",
  "Culaea inconstans": "Brook Stickleback",
  "Gasterosteus aculeatus": "Three-Spined Stickleback",
  "Etheostoma nigrum": "Johnny Darter",
  "Etheostoma flabellare": "Fantail Darter",
  "Percopsis omiscomaycus": "Trout-Perch",
  "Petromyzon marinus": "Sea Lamprey",
  "Lampetra lamottei": "American Brook Lamprey",
  "Cottus bairdii": "Mottled Sculpin",
  "Cottus ricei": "Spoonhead Sculpin",
  "Moxostoma macrolepidot um": "Shorthead Redhorse",
};

interface Regulation {
  species: string;
  catch_limit: string;
  note: string;
  fishing_device: string;
}

interface ZoneData {
  regulations: Regulation[];
}

interface ZonesData {
  [key: string]: ZoneData;
}

interface RegulationResult {
  isAllowed: boolean;
  regulations: Regulation[];
  message?: string;
}

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [identificationResult, setIdentificationResult] = useState<any>(null)
  const [isCaptured, setIsCaptured] = useState(false)
  const navigation = useNavigation()
  const { selectedZone } = useZone()
  const cameraRef = useRef(null)

  const checkFishingRegulations = (
    scientificName: string,
    commonName: string | null,
    zoneNumber: number,
    zonesData: ZonesData
  ): RegulationResult => {
    const zoneKey = `zone_${zoneNumber}`;
    const zone = zonesData[zoneKey];
    console.log(scientificName)
    console.log(commonName)
    console.log(zoneNumber)
    console.log(zonesData)
    if (!zone) {
      return {
        isAllowed: false,
        regulations: [],
        message: "Zone data not found. Please contact local authorities for fishing regulations."
      };
    }

    // Create an array of possible names to check against regulations
    const namesToCheck = [
      scientificName,
      commonName,
      FISH_COMMON_NAMES[scientificName]
    ].filter(Boolean);

    // Find all matching regulations
    const matchingRegulations = zone.regulations.filter(reg => 
      namesToCheck.some(name => 
        reg.species.toLowerCase().includes(name!.toLowerCase())
      )
    );

    // Check if fishing is explicitly prohibited
    const isProhibited = matchingRegulations.some(
      reg => reg.catch_limit.toLowerCase().includes('prohibited')
    );

    if (isProhibited) {
      return {
        isAllowed: false,
        regulations: matchingRegulations,
        message: "Fishing for this species is prohibited in this zone."
      };
    }

    if (matchingRegulations.length === 0) {
      // Check if there's an "Other species" regulation
      const otherSpeciesReg = zone.regulations.find(
        reg => reg.species.toLowerCase() === "other species"
      );

      if (otherSpeciesReg) {
        return {
          isAllowed: true,
          regulations: [otherSpeciesReg],
          message: "This species falls under general regulations."
        };
      }

      return {
        isAllowed: false,
        regulations: [],
        message: "No specific regulations found for this species. Please contact local authorities or release the fish."
      };
    }

    return {
      isAllowed: true,
      regulations: matchingRegulations
    };
  };

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      setIsCaptured(true)

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: true,
      })

      setCapturedImage(photo.uri)
      console.log(photo.uri, "PHOTO")

      await identifyFishInImage(photo.uri)

      setTimeout(() => {
        setIsCaptured(false)
      }, 500)
    } catch (error) {
      console.error("Error taking picture:", error)
      setIsCaptured(false)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri)
      identifyFishInImage(result.assets[0].uri)
    }
  }

  const identifyFishInImage = async (imageUri: string) => {
    try {
      const result = await identifyFish(imageUri)
      console.log("API Result:", result)
      console.log(selectedZone, "selectedZone")
      if (!selectedZone) {
        setIdentificationResult(result);
        return;
      }
      
      if (!result.scientificName) {
        console.log("Missing scientific name in result")
        setIdentificationResult(result);
        return;
      }
      console.log()
      const regulations = checkFishingRegulations(
        result.scientificName,
        result.commonName,
        selectedZone,
        require('../data/data.json')
      )
      setIdentificationResult({ ...result, regulations })
      console.log("Identification Result:", result)
      console.log("Regulations:", regulations)
    } catch (error) {
      console.error("Error identifying fish:", error)
      setIdentificationResult(null)
    }
  }

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          {identificationResult && (
            <View style={styles.resultContainer}>
              {identificationResult.commonName && (
                <Text style={styles.resultText}>
                  Common Name: {identificationResult.commonName}
                </Text>
              )}
              <Text style={styles.resultText}>
                Scientific Name: {identificationResult.scientificName}
              </Text>
              <Text style={styles.resultText}>
                Accuracy: {(identificationResult.accuracy * 100).toFixed(1)}%
              </Text>

              {/* Regulations Section */}
              {selectedZone && identificationResult.regulations && (
                <View style={styles.regulationsContainer}>
                  <Text style={[styles.resultText, styles.regulationHeader]}>
                    Fishing Regulations for Zone {selectedZone}:
                  </Text>
                  
                  {identificationResult.regulations.message && (
                    <Text style={[styles.resultText, styles.warning]}>
                      {identificationResult.regulations.message}
                    </Text>
                  )}
                  
                  {identificationResult.regulations.regulations.map((reg: Regulation, index: number) => (
                    <View key={index} style={styles.regulationItem}>
                      <Text style={styles.resultText}>Catch Limit: {reg.catch_limit}</Text>
                      {reg.note !== "Not specified" && (
                        <Text style={styles.resultText}>Note: {reg.note}</Text>
                      )}
                      {reg.fishing_device !== "Not specified" && (
                        <Text style={styles.resultText}>
                          Fishing Device: {reg.fishing_device}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                setCapturedImage(null)
                setIdentificationResult(null)
              }}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={pickImage}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.infoButton} onPress={() => Linking.openURL("https://www.quebec.ca/tourisme-et-loisirs/activites-sportives-et-de-plein-air/peche-sportive/versions-imprimables")}>
              <Ionicons name="information-circle-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture} disabled={isCaptured}>
              <Ionicons name="fish" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {isCaptured && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Identifying Fish...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 141, 165, 0.8)", // Teal color
    borderRadius: 30,
    padding: 15,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: 10,
  },
  message: {
    textAlign: "center",
    padding: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E6F3F5",
  },
  preview: {
    width: 300,
    height: 400,
    marginBottom: 20,
    borderRadius: 10,
  },
  resultContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    maxHeight: '40%',
  },
  resultText: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 105, 148, 0.6)", // Deep blue color
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  regulationsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 15,
  },
  regulationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  regulationItem: {
    marginBottom: 10,
  },
  warning: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
})