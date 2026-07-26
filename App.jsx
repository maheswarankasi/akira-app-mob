import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- Screens ---
import Splash1Screen from "./src/screens/Splash1Screen";
import Splash2Screen from "./src/screens/Splash2Screen";
import LanguageScreen from "./src/screens/LanguageScreen";
import HomeScreen from "./src/screens/HomeScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OTPScreen from "./src/screens/OtpScreen";
import LocationScreen from "./src/screens/LocationScreen";
import AddressDetailsScreen from "./src/screens/AddressDetailsScreen";
import ProductDetailsScreen from "./src/screens/ProductDetailsScreen";
import CartScreen from "./src/screens/CartScreen"; // <-- Cart ஸ்கிரீனை மறக்காமல் இம்போர்ட் செய்யவும்

import "./src/i18n";

// --- Redux ---
import { Provider, useDispatch } from "react-redux";
import { store } from "./src/store/store";
import { setCart } from "./src/store/cartSlice"; // <-- இது மிஸ்ஸிங்
import AsyncStorage from "@react-native-async-storage/async-storage"; // <-- இதுவும் மிஸ்ஸிங்
import AllCategoriesScreen from "./src/screens/AllCategoriesScreen";
import MainTabNavigator from "./src/navigations/MainTabNavigator";
import ManageAddressesScreen from "./src/screens/ManageAddressesScreen";

const Stack = createNativeStackNavigator();

// ------------------------------------------------------------------
// 1. பிரித்து எடுக்கப்பட்ட Main Component (இங்குதான் useDispatch வேலை செய்யும்)
// ------------------------------------------------------------------
function MainApp() {
  const [splashStep, setSplashStep] = useState(0);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  // இப்போது useDispatch பாதுகாப்பாக Provider-க்கு உள்ளே இருக்கிறது!
  const dispatch = useDispatch();

  useEffect(() => {
    if (splashStep === 0) {
      const timer = setTimeout(() => setSplashStep(1), 2000);
      return () => clearTimeout(timer);
    } else if (splashStep === 1) {
      const timer = setTimeout(() => setSplashStep(2), 2000);
      return () => clearTimeout(timer);
    }
  }, [splashStep]);

  useEffect(() => {
    const loadCartData = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("@cart");
        if (storedCart) {
          dispatch(setCart(JSON.parse(storedCart)));
        }
      } catch (e) {
        console.log("Failed to load cart", e);
      }
    };
    loadCartData();
  }, [dispatch]);

  if (splashStep === 0) {
    return <Splash1Screen />;
  } else if (splashStep === 1) {
    return <Splash2Screen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isFirstTimeUser ? "Language" : "Home"}>
        {isFirstTimeUser ? (
          <>
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Otp"
              component={OTPScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Location"
              component={LocationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddressDetails"
              component={AddressDetailsScreen}
              options={{ headerShown: false }}
            />

            {/* Main Flow */}
            <Stack.Screen
              name="Home"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetailsScreen"
              component={ProductDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AllCategoriesScreen"
              component={AllCategoriesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CartScreen"
              component={CartScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ManageAddressesScreen"
              component={ManageAddressesScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetailsScreen"
              component={ProductDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AllCategoriesScreen"
              component={AllCategoriesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CartScreen"
              component={CartScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ManageAddressesScreen"
              component={ManageAddressesScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ------------------------------------------------------------------
// 2. Root App Component (இது Provider-ஐ மட்டும் கொடுக்கும்)
// ------------------------------------------------------------------
export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
