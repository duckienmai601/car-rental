import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, StyleSheet } from "react-native";
import HomeScreen from "./src/HomeScreen";
import MapScreen from "./src/MapScreen";
import SettingsScreen from "./src/SettingsScreen";
import SavedScreen from "./src/HistoryOrderScreen";
import InfoScreen from "./src/InfoScreen";
import LoginScreen from "./src/LoginScreen";
import SignupScreen from "./src/SignupScreen";
import RentDayScreen from "./src/RentDayScreen"; 
import PrivacyScreen from "./src/PrivacyScreen"; 
import ForgotPasswordScreen from "./src/ForgotPasswordScreen";
import CheckoutScreen from "./src/CheckoutScreen";
import PaymentMethodScreen from "./src/PaymentMethodScreen";
import ReviewSummaryScreen from "./src/ReviewSummaryScreen";
import OrderSuccessfulScreen from "./src/OrderSuccessfulScreen";
import OrderDetailsScreen from "./src/OrderDetailScreen";
import NotifyScreen from "./src/NotifyScreen";



const homeIcon_active = require("./src/assets/icons/home-active.png");
const homeIcon = require("./src/assets/icons/home.png");
const compass_active = require("./src/assets/icons/compass-active.png");
const compass = require("./src/assets/icons/compass.png");
const savedIcon_active = require("./src/assets/icons/saved-active.png");
const savedIcon = require("./src/assets/icons/saved.png");
const settingsIcon_active = require("./src/assets/icons/settings-active.png");
const settingsIcon = require("./src/assets/icons/settings.png");


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Initial" component={HomeScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? homeIcon_active : homeIcon;
          } else if (route.name === "Map") {
            iconName = focused ? compass_active : compass;
          } else if (route.name === "Saved") {
            iconName = focused ? savedIcon_active : savedIcon;
          } else if (route.name === "Settings") {
            iconName = focused ? settingsIcon_active : settingsIcon;
          }
          return <Image source={iconName} resizeMode="contain" style={styles.footerIcon} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          padding: 10,
          backgroundColor: "black",
          borderTopStartRadius: 40,
          borderTopEndRadius: 40,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="RentDay" component={RentDayScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen name="ReviewSummary" component={ReviewSummaryScreen} />
        <Stack.Screen name="OrderSuccessful" component={OrderSuccessfulScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Notify" component={NotifyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  footerIcon: {
    width: 25,
  },
});
