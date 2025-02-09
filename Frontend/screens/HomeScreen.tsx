import React, { useState } from "react";
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

// Importing local image from assets
const ZONES = Array.from({ length: 29 }, (_, i) => i + 1);
const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const MAX_ZOOM = 6;
  const MIN_ZOOM = 1;

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      if (newScale >= MIN_ZOOM && newScale <= MAX_ZOOM) {
        scale.value = newScale;
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      positionX.value = savedX.value + e.translationX;
      positionY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = positionX.value;
      savedY.value = positionY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AquaScan</Text>
          <Text style={styles.subtitle}>Select your fishing zone</Text>
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
        </View>

        {/* Zone Selector */}
        <View style={styles.zoneSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ZONES.map((zone) => (
              <TouchableOpacity
                key={zone}
                style={[styles.zoneButton, selectedZone === zone && styles.selectedZone]}
                onPress={() => setSelectedZone(zone)}
              >
                <Text style={[styles.zoneText, selectedZone === zone && styles.selectedZoneText]}>{zone}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Zone Info */}
        {selectedZone && (
          <View style={styles.selectedZoneInfo}>
            <Ionicons name="location" size={24} color="#008DA5" />
            <Text style={styles.selectedZoneTitle}>Zone {selectedZone} Selected</Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
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
    marginBottom: 16,
  },
  mapContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: "#fff",
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: "100%",
    height: "100%",
  },
  zoneSelector: {
    paddingVertical: 16,
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
  selectedZoneInfo: {
    marginTop: 20,
    marginHorizontal: 16,
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
});