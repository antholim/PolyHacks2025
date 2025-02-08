"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Camera } from "expo-camera"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCaptured, setIsCaptured] = useState(false)
  const cameraRef = useRef<Camera | null>(null)
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsCaptured(true)
      const photo = await cameraRef.current.takePictureAsync()
      setTimeout(() => {
        navigation.navigate("FishInfo", { imageUri: photo.uri })
        setIsCaptured(false)
      }, 500)
    }
  }

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.infoButton} onPress={() => navigation.navigate("FishInfo")}>
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture} disabled={isCaptured}>
            <Ionicons name="camera" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
      {isCaptured && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Processing...</Text>
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
})

