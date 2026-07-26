import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalize } from "../utils/responsive";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const [userData, setUserData] = useState({ name: "", phone: "" });

  // useFocusEffect: ஸ்கிரீனுக்கு வரும்போதெல்லாம் இது இயங்கும்
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const currentPhone = await AsyncStorage.getItem("currentUserPhone");
          if (currentPhone) {
            const storedProfile = await AsyncStorage.getItem(`userProfile_${currentPhone}`);
            if (storedProfile) {
              const parsed = JSON.parse(storedProfile);
              setUserData({
                // Object Structure மாறியதால் நேரடி Name-ஐ எடுக்கிறோம்
                name: parsed.name || "",
                phone: currentPhone,
                addressCount: parsed.addresses ? parsed.addresses.length : 0
              });
            } else {
              setUserData({ name: "", phone: currentPhone, addressCount: 0 });
            }
          }
        } catch (e) {
          console.log("Error fetching profile", e);
        }
      };
      fetchUserData();
    }, [])
  );

  const handleEditProfile = () => {
    // Edit செய்ய Address ஸ்கிரீனுக்கு அனுப்புகிறோம்
    navigation.navigate("AddressDetails", { 
      phoneNumber: userData.phone, 
      isEdit: true 
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language?.includes("ta") ? "en" : "ta";
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", style: "destructive",
        onPress: async () => {
          // Token மற்றும் தற்போதைய போன் நம்பரை மட்டும் நீக்கினால் போதும்
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("currentUserPhone");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }
    ]);
  };

  const renderMenuItem = (icon, title, onPress, rightContent = null) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconBg}>
        <Ionicons name={icon} size={normalize(20)} color="#058A46" />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      {rightContent ? rightContent : <Ionicons name="chevron-forward" size={normalize(18)} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("profile_title")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* User Info Header with EDIT Button */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={normalize(40)} color="#A7F3D0" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name || t("guest_user")}</Text>
            <Text style={styles.userPhone}>
              {userData.phone ? `+91 ${userData.phone}` : "No phone number added"}
            </Text>
          </View>
          
          {/* Edit Button */}
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={normalize(18)} color="#058A46" />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          {renderMenuItem("cube-outline", t("my_orders"), () => console.log("Orders clicked"))}
          {/* {renderMenuItem("location-outline", t("manage_addresses"), handleEditProfile)} */}
          {renderMenuItem("location-outline", t("manage_addresses"), () => navigation.navigate("ManageAddressesScreen"))}
          {renderMenuItem(
            "language-outline", t("change_language"), toggleLanguage,
            <Text style={styles.langTag}>{i18n.language?.includes("ta") ? "தமிழ்" : "English"}</Text>
          )}
        </View>

        <View style={styles.menuSection}>
          {renderMenuItem("help-buoy-outline", t("help_support"), () => console.log("Help clicked"))}
          {renderMenuItem("information-circle-outline", t("about_us"), () => console.log("About clicked"))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={normalize(20)} color="#EF4444" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... styles முந்தைய கோடில் இருந்தபடியே தொடரும்
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { paddingHorizontal: normalize(16), paddingTop: Platform.OS === "ios" ? normalize(10) : normalize(20), paddingBottom: normalize(16), backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: normalize(20), fontWeight: "bold", color: "#111827" },
  scrollContent: { padding: normalize(16), paddingBottom: normalize(40) },
  profileHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: normalize(16), borderRadius: normalize(12), marginBottom: normalize(24), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: normalize(4), elevation: 2 },
  avatarContainer: { width: normalize(60), height: normalize(60), borderRadius: normalize(30), backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center", marginRight: normalize(16) },
  userInfo: { flex: 1 },
  userName: { fontSize: normalize(16), fontWeight: "bold", color: "#111827", marginBottom: normalize(4) },
  userPhone: { fontSize: normalize(12), color: "#6B7280" },
  editBtn: { padding: normalize(8), backgroundColor: "#F0FDF4", borderRadius: normalize(8) },
  menuSection: { backgroundColor: "#FFF", borderRadius: normalize(12), marginBottom: normalize(20), overflow: "hidden", borderWidth: 1, borderColor: "#F3F4F6" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: normalize(16), borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  menuIconBg: { width: normalize(36), height: normalize(36), borderRadius: normalize(8), backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center", marginRight: normalize(12) },
  menuTitle: { flex: 1, fontSize: normalize(14), fontWeight: "500", color: "#374151" },
  langTag: { fontSize: normalize(12), fontWeight: "bold", color: "#058A46", backgroundColor: "#D1FAE5", paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(4) },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", padding: normalize(16), borderRadius: normalize(12), marginTop: normalize(10), borderWidth: 1, borderColor: "#FEE2E2" },
  logoutText: { color: "#EF4444", fontWeight: "bold", fontSize: normalize(14), marginLeft: normalize(8) },
});