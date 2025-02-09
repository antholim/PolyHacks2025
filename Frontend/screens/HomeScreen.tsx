import React, { useState } from "react";
import { Text, StyleSheet, View, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReactNativeZoomableView } from "@dudigital/react-native-zoomable-view";

// Importing local image from assets
const ZONES = Array.from({ length: 29 }, (_, i) => i + 1);
const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to AquaScan</Text>
        <Text style={styles.subtitle}>Select your fishing zone</Text>
      </View>

      {/* Map with Zoom */}
      <View style={styles.mapContainer}>
        <ReactNativeZoomableView
          maxZoom={2}
          minZoom={1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true}
          style={styles.zoomableView}
        >
          <Image 
            source={require("../assets/carte-generale-zones.png")} 
            style={styles.map} 
            resizeMode="contain" 
            onError={(e) => console.log("Image failed to load", e.nativeEvent.error)}
          />
        </ReactNativeZoomableView>
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
    height: width,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  zoomableView: {
    width: "100%",
    height: "100%",
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