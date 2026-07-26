import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { normalize } from "../utils/responsive";

export default function AddressDetailsScreen({ route, navigation }) {
  const { phoneNumber, addressText, locationData, addressObj, isEdit, addressToEdit, fromManageAddress } = route.params || {};
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  const getLocalText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj.en || obj.ta || "";
  };

  // --- NEW LOGIC: Live Location-ல் இருந்து City & State-ஐ மட்டும் பிரித்தெடுப்பது ---
  const getCityState = () => {
    if (!addressObj) return "";
    const city = addressObj.city || addressObj.subregion || addressObj.district || "";
    const state = addressObj.region || ""; // region என்பது State-ஐ குறிக்கும்
    
    // இரண்டும் இருந்தால் கமா போட்டு காட்டவும்
    if (city && state) return `${city}, ${state}`;
    return city || state;
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  
  const [houseNo, setHouseNo] = useState(addressToEdit ? getLocalText(addressToEdit.houseNo) : "");
  
  // Street-ஐ Live Location-ல் இருந்து எடுக்காமல் காலியாக (Empty) விடுகிறோம், யூசரே டைப் செய்ய வேண்டும்
  const [street, setStreet] = useState(addressToEdit ? getLocalText(addressToEdit.street) : "");
  
  // Locality-க்கு City, State-ஐ மட்டும் Default ஆக வைக்கிறோம்
  const [locality, setLocality] = useState(addressToEdit ? getLocalText(addressToEdit.locality) : getCityState());
  
  const [activeLabel, setActiveLabel] = useState(addressToEdit ? addressToEdit.label : "lbl_home");

  const [touched, setTouched] = useState({ name: false, houseNo: false, street: false, locality: false });
  const labels = ["lbl_home", "lbl_work", "lbl_gym", "lbl_other"];

  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(`userProfile_${phoneNumber}`);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
        }
      } catch (error) {
        console.log("Error loading profile", error);
      }
    };
    loadExistingProfile();
  }, [phoneNumber]);

  const isFormValid = name.trim() !== "" && houseNo.trim() !== "" && street.trim() !== "" && locality.trim() !== "";

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSaveAddress = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(`userProfile_${phoneNumber}`);
      let userProfile = storedProfile ? JSON.parse(storedProfile) : {
        phoneNumber, name: "", email: "", addresses: [] 
      };

      userProfile.name = name;
      if (email) userProfile.email = email;

      // --- NEW LOGIC: யூசர் Type செய்ததை மட்டும் வைத்து முழு முகவரியை (Full Address) உருவாக்குவது ---
      // (Live Location-ல் இருந்து வரும் தேவையற்ற குப்பைகளைத் தவிர்த்து விடுகிறோம்)
      const customFullAddress = `${houseNo}, ${street}, ${locality}`;

      const newAddress = {
        id: addressToEdit ? addressToEdit.id : Date.now().toString(),
        label: activeLabel,
        coordinates: locationData || (addressToEdit ? addressToEdit.coordinates : null),
        houseNo: { en: houseNo, ta: houseNo },
        street: { en: street, ta: street },
        locality: { en: locality, ta: locality },
        // addressText (Live Location)-க்கு பதிலாக customFullAddress-ஐ சேமிக்கிறோம்
        fullAddress: { en: customFullAddress, ta: customFullAddress }, 
      };

      if (!userProfile.addresses) userProfile.addresses = [];

      if (addressToEdit) {
        const index = userProfile.addresses.findIndex(a => a.id === addressToEdit.id);
        if (index !== -1) {
          userProfile.addresses[index] = newAddress;
        }
      } else {
        userProfile.addresses.push(newAddress);
      }

      await AsyncStorage.setItem(`userProfile_${phoneNumber}`, JSON.stringify(userProfile));
      
      // --- NEW NAVIGATION LOGIC ---
      if (fromManageAddress) {
        // Profile -> Manage Address வழியாக வந்திருந்தால் அங்கே திரும்பவும்
        navigation.goBack();
      } else {
        // 1st time Login வழியாக வந்திருந்தால் Home-க்கு செல்லவும்
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (e) {
      console.log("Error saving address:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     <View style={styles.header}>
        {/* --- BACK BUTTON LOGIC UPDATED --- */}
        <TouchableOpacity 
          onPress={() => {
            if (fromManageAddress) {
              navigation.goBack();
            } else {
              navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            }
          }} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={normalize(24)} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{addressToEdit ? t("edit") : t("add_address_details")}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t("receiver_details")}<Text style={{ color: "#FF2A5F" }}>*</Text></Text>
          <View style={[styles.inputBox, touched.name && name.trim() === "" && styles.inputError]}>
            <TextInput style={styles.input} placeholder={t("name_placeholder")} value={name} onChangeText={setName} onBlur={() => handleBlur("name")} />
          </View>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} value={`+91    ${phoneNumber}`} editable={false} color="#666" />
          </View>
          <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder={t("email_placeholder")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.sectionTitle}>{t("address_label")}<Text style={{ color: "#FF2A5F" }}>*</Text></Text>
          <View style={styles.labelContainer}>
            {labels.map((labelKey) => (
              <TouchableOpacity key={labelKey} style={[styles.labelBadge, activeLabel === labelKey && styles.labelBadgeActive]} onPress={() => setActiveLabel(labelKey)}>
                <Ionicons name={labelKey === "lbl_home" ? "home-outline" : labelKey === "lbl_work" ? "briefcase-outline" : "barbell-outline"} size={normalize(16)} color={activeLabel === labelKey ? "#FFF" : "#666"} style={{ marginRight: normalize(6) }} />
                <Text style={[styles.labelText, activeLabel === labelKey && styles.labelTextActive]}>{t(labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t("add_address")}<Text style={{ color: "#FF2A5F" }}>*</Text></Text>
          <View style={[styles.inputBox, touched.houseNo && houseNo.trim() === "" && styles.inputError]}>
            <TextInput style={styles.input} placeholder={t("house_no_placeholder")} value={houseNo} onChangeText={setHouseNo} onBlur={() => handleBlur("houseNo")} />
          </View>
          <View style={[styles.inputBox, touched.street && street.trim() === "" && styles.inputError]}>
            <TextInput style={styles.input} placeholder={t("street_placeholder")} value={street} onChangeText={setStreet} onBlur={() => handleBlur("street")} />
          </View>
          <View style={[styles.inputBox, touched.locality && locality.trim() === "" && styles.inputError]}>
            <TextInput style={styles.input} placeholder={t("locality")} value={locality} onChangeText={setLocality} onBlur={() => handleBlur("locality")} />
          </View>
        </ScrollView>

        {isFormValid && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>{t("save_address")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: normalize(16), paddingTop: Platform.OS === "android" ? normalize(50) : normalize(20), paddingBottom: normalize(16), backgroundColor: "#FFF" },
  backButton: { padding: normalize(5), marginRight: normalize(15) },
  headerTitle: { fontSize: normalize(18), fontWeight: "bold", color: "#000" },
  scrollContent: { padding: normalize(24), paddingBottom: normalize(100) },
  sectionTitle: { fontSize: normalize(16), fontWeight: "bold", color: "#000", marginBottom: normalize(12), marginTop: normalize(10) },
  inputBox: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: normalize(10), paddingHorizontal: normalize(16), height: normalize(50), justifyContent: "center", marginBottom: normalize(12), backgroundColor: "#FFF" },
  inputError: { borderColor: "#EF4444", borderWidth: 1.5 },
  input: { fontSize: normalize(16), color: "#000" },
  labelContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: normalize(20) },
  labelBadge: { flexDirection: "row", alignItems: "center", paddingVertical: normalize(8), paddingHorizontal: normalize(16), borderRadius: normalize(20), borderWidth: 1, borderColor: "#E5E7EB", marginRight: normalize(10), marginBottom: normalize(10), backgroundColor: "#FFF" },
  labelBadgeActive: { backgroundColor: "#0DB481", borderColor: "#0DB481" },
  labelText: { fontSize: normalize(14), color: "#666" },
  labelTextActive: { color: "#FFF", fontWeight: "bold" },
  bottomBar: { padding: normalize(24), backgroundColor: "#FAFAFA", borderTopWidth: 1, borderColor: "#E5E7EB" },
  saveButton: { backgroundColor: "#0DB481", paddingVertical: normalize(16), borderRadius: normalize(12), alignItems: "center" },
  saveButtonText: { color: "#FFF", fontSize: normalize(16), fontWeight: "bold" },
});