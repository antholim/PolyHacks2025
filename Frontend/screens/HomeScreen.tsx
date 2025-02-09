import { useState } from "react"
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"

const ZONES = Array.from({ length: 29 }, (_, i) => i + 1)
const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null)

  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const positionX = useSharedValue(0)
  const positionY = useSharedValue(0)
  const savedX = useSharedValue(0)
  const savedY = useSharedValue(0)

  const MAX_ZOOM = 6
  const MIN_ZOOM = 1

  const pinchGesture = Gesture.Pinch()
      .onUpdate((e) => {
        const newScale = savedScale.value * e.scale
        if (newScale >= MIN_ZOOM && newScale <= MAX_ZOOM) {
          scale.value = newScale
        }
      })
      .onEnd(() => {
        savedScale.value = scale.value
      })

  const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        positionX.value = savedX.value + e.translationX
        positionY.value = savedY.value + e.translationY
      })
      .onEnd(() => {
        savedX.value = positionX.value
        savedY.value = positionY.value
      })

  const composed = Gesture.Simultaneous(pinchGesture, panGesture)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: positionX.value }, { translateY: positionY.value }, { scale: scale.value }] as const,
  }))

  const resetMap = () => {
    scale.value = 1;
    savedScale.value = 1;
    positionX.value = 0;
    positionY.value = 0;
    savedX.value = 0;
    savedY.value = 0;
  };

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to AquaScan</Text>
            <Text style={styles.subtitle}>Select your fishing zone</Text>
            <Ionicons name="fish" size={40} color="#008DA5" style={styles.fishIcon} />
          </View>

          <View style={styles.mapContainer}>
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.mapWrapper, animatedStyle]}>
                <Image
                    style={styles.map}
                    source={require("../assets/carte-generale-zones.png")}
                    contentFit="contain"
                    onError={(error) => {
                      console.error("Image failed to load:", error);
                    }}
                />
              </Animated.View>
            </GestureDetector>
            <TouchableOpacity style={styles.resetButton} onPress={resetMap}>
              <Ionicons name="refresh" size={24} color="#008DA5" />
            </TouchableOpacity>
          </View>

          <View style={styles.zoneSelectorContainer}>
            <LinearGradient
              colors={["rgba(230, 243, 245, 1)", "rgba(230, 243, 245, 0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.1, y: 0 }}
              style={styles.gradientLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={["rgba(230, 243, 245, 0)", "rgba(230, 243, 245, 1)"]}
              start={{ x: 0.9, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientRight}
              pointerEvents="none"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zoneSelector}>
              {ZONES.map((zone) => (
                  <TouchableOpacity
                      key={zone}
                      style={[styles.zoneButton, selectedZone === zone && styles.selectedZone]}
                      onPress={() => setSelectedZone(zone)}
                  >
                    {selectedZone === zone ? (
                        <Ionicons name="fish" size={24} color="#fff" />
                    ) : (
                        <Text style={[styles.zoneText, selectedZone === zone && styles.selectedZoneText]}>{zone}</Text>
                    )}
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.selectedZoneContainer}>
            {selectedZone ? (
                <View style={styles.selectedZoneInfo}>
                  <Ionicons name="location" size={24} color="#008DA5" />
                  <Text style={styles.selectedZoneTitle}>Zone {selectedZone} Selected</Text>
                </View>
            ) : (
                <View style={styles.selectedZoneInfo}>
                  <Ionicons name="information-circle-outline" size={24} color="#666" />
                  <Text style={styles.noZoneSelectedText}>No zone selected</Text>
                </View>
            )}
          </View>
        </ScrollView>
      </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F3F5",
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  fishIcon: {
    marginBottom: 16,
  },
  mapContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 16,
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  zoneSelectorContainer: {
    position: "relative",
    paddingVertical: 16,
  },
  zoneSelector: {
    paddingHorizontal: 16,
  },
  zoneButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#008DA5",
    marginHorizontal: 8,
  },
  selectedZone: {
    backgroundColor: "#008DA5",
  },
  zoneText: {
    fontSize: 18,
    color: "#008DA5",
  },
  selectedZoneText: {
    color: "#fff",
  },
  selectedZoneContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  selectedZoneInfo: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  selectedZoneTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008DA5",
  },
  noZoneSelectedText: {
    fontSize: 18,
    color: "#666",
  },
  gradientLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 800,
    zIndex: 1,
  },
  gradientRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 800,
    zIndex: 1,
  },

  resetButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 8,
  },

})

