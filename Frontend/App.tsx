import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { ZoneProvider } from './context/ZoneContext'

import HomeScreen from "./screens/HomeScreen"
import CameraScreen from "./screens/CameraScreen"
import HistoryScreen from "./screens/HistoryScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <ZoneProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName

              if (route.name === "Home") {
                iconName = focused ? "water" : "water-outline"
              } else if (route.name === "Camera") {
                iconName = focused ? "fish" : "fish-outline"
              } else if (route.name === "History") {
                iconName = focused ? "boat" : "boat-outline"
              }

              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#008DA5", // Teal color
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              backgroundColor: "#E6F3F5", // Light blue background
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: "AquaScan" }} />
          <Tab.Screen name="Camera" component={CameraScreen} options={{ title: "Identify" }} />
          <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Catches" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </ZoneProvider>
  )
}

