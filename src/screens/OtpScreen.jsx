import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { normalize } from "../utils/responsive"; // உங்களது normalize ஃபங்ஷன்

export default function OtpScreen({ route, navigation }) {
  const { phoneNumber } = route.params;
  const { t } = useTranslation();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60); // 60s timer state
  const [isValidated, setIsValidated] = useState(false); // Box color change panna state
  const inputs = useRef([]);

  // --- TIMER EFFECT ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup function
  }, [timer]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setIsValidated(false); // Pudhusa type panna green-ah normal grey ku mathida

    // Adutha box-ku auto-focus panna
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }

    // 4 digits-um enter pannathum automatic-ah verify panna
    if (index === 3 && text) {
      Keyboard.dismiss();
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (enteredOtp) => {
    if (enteredOtp === "1234") {
      setIsValidated(true);

      setTimeout(async () => {
        try {
          const currentDate = new Date();
          const expiryDate = currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;

          await AsyncStorage.setItem("userToken", "dummy_token_123");
          await AsyncStorage.setItem("loginExpiry", expiryDate.toString());
          
          // தற்போதைய யூசரின் போன் நம்பரை சேமிக்கிறோம்
          await AsyncStorage.setItem("currentUserPhone", phoneNumber);

          // ஏற்கனவே உள்ள Profile-ஐ எடுக்கிறோம்
          const existingProfileStr = await AsyncStorage.getItem(`userProfile_${phoneNumber}`);

          if (existingProfileStr) {
            const existingProfile = JSON.parse(existingProfileStr);
            
            // Profile இருந்து, அதில் குறைந்தபட்சம் 1 Address ஆவது இருந்தால் Home-க்கு செல்லலாம்
            if (existingProfile.addresses && existingProfile.addresses.length > 0) {
              navigation.reset({ index: 0, routes: [{ name: "Home" }] });
              return;
            }
          }
          
          // புதிய யூசர் (அல்லது Address இல்லாதவர்) -> LocationScreen-க்கு அனுப்பவும்
          navigation.reset({
            index: 0,
            routes: [{ name: "Location", params: { phoneNumber } }],
          });

        } catch (e) {
          console.log("Storage Error: ", e);
        }
      }, 1000);
    } else {
      alert(t("invalid_otp_test"));
      setOtp(["", "", "", ""]); 
      inputs.current[0].focus();
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60); // Timer thirumba 60 la irunthu start aagum
      setOtp(["", "", "", ""]);
      setIsValidated(false);
      alert(`${t("new_otp_sent_to")} ${phoneNumber}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={normalize(24)} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("otp_verification")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>{t("sent_code_to")}</Text>
        <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>

        {/* 4 OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[
                styles.otpBox,
                { borderColor: isValidated ? "#03B75E" : "#D1D5DB" },
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              ref={(input) => (inputs.current[index] = input)}
            />
          ))}
        </View>

        {/* Validation Text */}
        {isValidated ? (
          <Text style={styles.successMessage}>{t("otp_verified_success")}</Text>
        ) : (
          <Text style={[styles.successMessage, { color: "transparent" }]}>
            -
          </Text>
        )}

        {/* Resend Timer Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t("did_not_get_otp")}</Text>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text
              style={[
                styles.resendLink,
                { color: timer === 0 ? "#000" : "#A3A3A3" },
              ]}
            >
              {timer > 0 ? `${t("resend_sms_in")} ${timer}s` : t("resend_sms")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === "ios" ? normalize(10) : normalize(60),
    paddingBottom: normalize(10),
  },
  backButton: {
    marginRight: normalize(16),
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 0.5,
    paddingHorizontal: normalize(24),
    paddingTop: normalize(40),
    alignItems: "center",
    justifyContent: "center",
  },
  instruction: {
    fontSize: normalize(14),
    color: "#666",
    marginBottom: normalize(8),
    textAlign: "center",
  },
  phoneNumber: {
    fontSize: normalize(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: normalize(40),
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: normalize(20),
  },
  otpBox: {
    width: normalize(50),
    height: normalize(50),
    borderWidth: 1.5,
    borderRadius: normalize(8),
    fontSize: normalize(24),
    textAlign: "center",
    backgroundColor: "#FFF",
    color: "#000",
  },
  successMessage: {
    color: "#03B75E",
    fontSize: normalize(14),
    marginBottom: normalize(20),
    fontWeight: "500",
  },
  resendContainer: {
    flexDirection: "row",
  },
  resendText: {
    color: "#666",
    fontSize: normalize(14),
  },
  resendLink: {
    fontSize: normalize(14),
    fontWeight: "bold",
  },
});
