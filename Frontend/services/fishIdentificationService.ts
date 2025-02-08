import AsyncStorage from "@react-native-async-storage/async-storage";

// This is a mock function to simulate AI-powered fish identification
// In a real application, you would replace this with an actual API call
export const identifyFish = async (imageUri: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock identification result
  const result = {
    species: "Rainbow Trout",
    scientificName: "Oncorhynchus mykiss",
    habitat: "Freshwater streams and lakes",
    size: "20-30 inches",
    fishingTips: "Use light tackle and small lures or flies.",
  };

  // Save to history
  await saveToHistory(imageUri, result.species);

  return result;
};

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

    await AsyncStorage.setItem(
      "fishHistory",
      JSON.stringify(history.slice(0, 50))
    ); // Keep last 50 items
  } catch (error) {
    console.error("Error saving to history:", error);
  }
};
