import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from "expo-image-picker";
import { identifyFish } from "../services/fishIdentificationService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<any>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const navigation = useNavigation();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    setIsCaptured(true);
    // Implementation will come in next version of expo-camera
    // When implemented, add:
    // setTimeout(() => {
    //   navigation.navigate("FishInfo", { imageUri: photo.uri });
    //   setIsCaptured(false);
    // }, 500);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      identifyFishInImage(result.assets[0].uri);
    }
  };

  const identifyFishInImage = async (imageUri: string) => {
    try {
      const result = await identifyFish(imageUri);
      setIdentificationResult(result);
    } catch (error) {
      console.error("Error identifying fish:", error);
    }
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          {identificationResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Species: {identificationResult.species}
              </Text>
              <Text style={styles.resultText}>
                Scientific Name: {identificationResult.scientificName}
              </Text>
              <Text style={styles.resultText}>
                Habitat: {identificationResult.habitat}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCapturedImage(null)}
          >
            <Text style={styles.buttonText}>Take Another Picture</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.infoButton} onPress={() => navigation.navigate("FishInfo")}>
              <Ionicons name="information-circle-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture} disabled={isCaptured}>
              <Ionicons name="camera" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      {isCaptured && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
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
  button: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 120, 255, 0.8)",
    borderRadius: 30,
    padding: 15,
  },
  infoButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: 10,
  },
  message: {
    textAlign: 'center',
    padding: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preview: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
