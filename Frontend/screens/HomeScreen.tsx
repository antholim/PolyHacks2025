import { Text, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AquaScan</Text>
      <Text style={styles.subtitle}>Dive into the world of fish identification with AI-powered technology</Text>
      <Ionicons name="fish" size={100} color="#008DA5" style={styles.icon} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E6F3F5", // Light blue background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  icon: {
    marginTop: 20,
  },
})

