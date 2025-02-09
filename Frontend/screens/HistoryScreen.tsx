import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"

export default function HistoryScreen() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("fishHistory")
      if (savedHistory !== null) {
        setHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  const deleteHistoryItem = async (id) => {
    try {
      const updatedHistory = history.filter((item) => item.id !== id)
      setHistory(updatedHistory)
      await AsyncStorage.setItem("fishHistory", JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Error deleting history item:", error)
    }
  }

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.itemDetails}>
        <View style={styles.speciesContainer}>
          <Ionicons name="fish-outline" size={18} color="#008DA5" />
          <Text style={styles.species}>{item.species}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteHistoryItem(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catch History</Text>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6F3F5", // Light blue background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  speciesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  species: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#FF6B6B", // Coral red color
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
})

