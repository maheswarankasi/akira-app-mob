import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert
} from "react-native";

// Responsive Helper
import { normalize } from "../utils/responsive";

export default function LoginScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState("");
  
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  const handleContinue = () => {
    if (mobileNumber.length === 10) {
      navigation.navigate("Otp", { phoneNumber: mobileNumber });
    } else {
      Alert.alert(t("alert_title"), t("invalid_mobile"));
    }
  };

  const handleNumberChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setMobileNumber(numericValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/Page-6.webp")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: "100%" }}
        >
          {/* Mela irukkura empty space-kaga intha View */}
          <View style={{ flex: 1 }} />

          {/* Bottom Form Container */}
          <View style={styles.formContainer}>
            <Text 
              style={[
                styles.title, 
                { fontSize: lang === "ta" ? normalize(18) : normalize(20) }
              ]}
            >
              {t("slogan")}
            </Text>
            
            <Text 
              style={[
                styles.subtitle, 
                { fontSize: lang === "ta" ? normalize(12) : normalize(14) }
              ]}
            >
              {t("loginOrSignup")}
            </Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: lang === "ta" ? normalize(14) : normalize(16) }
                ]}
                placeholder={t("mobile_placeholder")}
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={handleNumberChange}
                returnKeyType="done"
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.button,
                mobileNumber.length === 10
                  ? styles.buttonActive
                  : styles.buttonInactive,
              ]}
              onPress={handleContinue}
              disabled={mobileNumber.length !== 10}
              activeOpacity={0.8}
            >
              <Text 
                style={[
                  styles.buttonText, 
                  { fontSize: lang === "ta" ? normalize(14) : normalize(16) }
                ]}
              >
                {t("continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  formContainer: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(40), 
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)", 
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    paddingTop: normalize(30),
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: normalize(24),
    lineHeight: normalize(28),
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: normalize(16),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    height: normalize(50),
    marginBottom: normalize(24),
    backgroundColor: "#FFF",
  },
  countryCode: {
    fontSize: normalize(16),
    fontWeight: "bold",
    color: "#000",
    marginRight: normalize(10),
  },
  input: { 
    flex: 1, 
    color: "#000" 
  },
  button: {
    height: normalize(50),
    borderRadius: normalize(8),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: { 
    backgroundColor: "#44dd96" 
  },
  buttonInactive: { 
    backgroundColor: "#a7dabe" 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});