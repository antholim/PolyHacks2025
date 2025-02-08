import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { identifyFish } from "../services/fishIdentificationService";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      identifyFishInImage(photo.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setCapturedImage(result.uri);
      identifyFishInImage(result.uri);
    }
  };

  const identifyFishInImage = async (imageUri) => {
    try {
      const result = await identifyFish(imageUri);
      setIdentificationResult(result);
    } catch (error) {
      console.error("Error identifying fish:", error);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

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
              <Text style={styles.resultText}>
                Size: {identificationResult.size}
              </Text>
              <Text style={styles.resultText}>
                Fishing Tips: {identificationResult.fishingTips}
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
        <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>
        </Camera>
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
    justifyContent: "space-around",
    margin: 20,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    margin: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  preview: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
