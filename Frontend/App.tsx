import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"

import HomeScreen from "./screens/HomeScreen"
import CameraScreen from "./screens/CameraScreen"
import HistoryScreen from "./screens/HistoryScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Camera") {
              iconName = focused ? "camera" : "camera-outline"
            } else if (route.name === "History") {
              iconName = focused ? "list" : "list-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

