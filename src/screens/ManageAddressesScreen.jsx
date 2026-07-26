import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Platform, TextInput, ScrollView, Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalize } from "../utils/responsive";

export default function ManageAddressesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  const [addresses, setAddresses] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ஸ்கிரீனுக்கு வரும்போதெல்லாம் டேட்டாவை Refresh செய்ய
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      const currentPhone = await AsyncStorage.getItem("currentUserPhone");
      if (currentPhone) {
        setPhoneNumber(currentPhone);
        const storedProfile = await AsyncStorage.getItem(`userProfile_${currentPhone}`);
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.addresses && Array.isArray(parsedProfile.addresses)) {
            setAddresses(parsedProfile.addresses);
          }
        }
      }
    } catch (error) {
      console.log("Error fetching addresses:", error);
    }
  };

 const handleAddNewAddress = () => {
    // fromManageAddress: true சேர்க்கப்பட்டுள்ளது
    navigation.navigate("AddressDetails", { phoneNumber, fromManageAddress: true });
  };

 const handleUseCurrentLocation = () => {
    // fromManageAddress: true சேர்க்கப்பட்டுள்ளது
    navigation.navigate("Location", { phoneNumber, autoFetch: true, fromManageAddress: true });
  };

  // --- 3-Dot Menu Action ---
  const handleMenuPress = (addressObj) => {
    Alert.alert(
      t("manage_address_menu"),
      t("choose_action"),
      [
        { text: t("edit"), onPress: () => handleEditAddress(addressObj) },
        { text: t("delete"), onPress: () => confirmDelete(addressObj.id), style: "destructive" },
        { text: t("cancel"), style: "cancel" }
      ]
    );
  };

  // --- Edit Address ---
  const handleEditAddress = (addressObj) => {
    navigation.navigate("AddressDetails", { 
      phoneNumber, 
      addressToEdit: addressObj, 
      isEdit: true,
      fromManageAddress: true // <-- இதையும் சேர்க்கவும்
    });
  };

  // --- Delete Address ---
  const confirmDelete = (addressId) => {
    Alert.alert(t("delete_confirm_title"), t("delete_confirm_msg"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: () => deleteAddress(addressId) }
    ]);
  };

  const deleteAddress = async (addressId) => {
    try {
      // 1. Array-ல் இருந்து அந்த முகவரியை நீக்குகிறோம்
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);

      // 2. Storage-ல் அப்டேட் செய்கிறோம்
      const storedProfile = await AsyncStorage.getItem(`userProfile_${phoneNumber}`);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        parsedProfile.addresses = updatedAddresses;
        await AsyncStorage.setItem(`userProfile_${phoneNumber}`, JSON.stringify(parsedProfile));
      }
    } catch (error) {
      console.log("Error deleting address:", error);
    }
  };

  // --- Search Filter Logic ---
  const getLocalText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj.en || obj.ta || "";
  };

  const filteredAddresses = addresses.filter((addr) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // நகரம், தெரு, முழு முகவரி ஆகியவற்றில் தேடுகிறோம்
    const fullAddress = getLocalText(addr.fullAddress).toLowerCase();
    const street = getLocalText(addr.street).toLowerCase();
    const locality = getLocalText(addr.locality).toLowerCase();
    const label = t(addr.label || "lbl_home").toLowerCase();

    return fullAddress.includes(query) || street.includes(query) || locality.includes(query) || label.includes(query);
  });

  const getIconForLabel = (labelKey) => {
    switch (labelKey) {
      case "lbl_home": return "home-outline";
      case "lbl_work": return "briefcase-outline";
      case "lbl_gym": return "barbell-outline";
      default: return "location-outline";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={normalize(24)} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("select_location")}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={normalize(20)} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_address")}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery} // Search State Update
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={handleUseCurrentLocation} activeOpacity={0.8}>
            <MaterialCommunityIcons name="crosshairs-gps" size={normalize(22)} color="#058A46" style={styles.actionIcon} />
            <Text style={styles.actionText}>{t("use_current_location")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleAddNewAddress} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={normalize(22)} color="#058A46" style={styles.actionIcon} />
            <Text style={styles.actionText}>{t("add_new_address")}</Text>
          </TouchableOpacity>
        </View>

        {/* Filtered Addresses List */}
        {filteredAddresses.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>{t("saved_address")}</Text>
            
            <View style={styles.listContainer}>
              {filteredAddresses.map((addr, index) => (
                <View key={addr.id || index} style={[styles.addressItem, index === filteredAddresses.length - 1 && styles.lastItem]}>
                  <View style={styles.iconBox}>
                    <Ionicons name={getIconForLabel(addr.label)} size={normalize(20)} color="#374151" />
                  </View>
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressLabel}>{t(addr.label || "lbl_home")}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {getLocalText(addr.fullAddress) || `${getLocalText(addr.houseNo)}, ${getLocalText(addr.street)}`}
                    </Text>
                  </View>

                  {/* 3-Dot Menu Button */}
                  <TouchableOpacity 
                    style={styles.menuBtn} 
                    activeOpacity={0.7}
                    onPress={() => handleMenuPress(addr)} // Menu Logic
                  >
                    <Ionicons name="ellipsis-vertical" size={normalize(20)} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: normalize(16), paddingTop: Platform.OS === "ios" ? normalize(10) : normalize(40), paddingBottom: normalize(16), backgroundColor: "#FFF" },
  backBtn: { padding: normalize(4), marginRight: normalize(8), marginLeft: normalize(-4) },
  headerTitle: { fontSize: normalize(18), fontWeight: "bold", color: "#111827" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", marginHorizontal: normalize(16), marginTop: normalize(8), marginBottom: normalize(16), paddingHorizontal: normalize(12), height: normalize(48), borderRadius: normalize(8), borderWidth: 1, borderColor: "#D1FAE5" },
  searchIcon: { marginRight: normalize(8) },
  searchInput: { flex: 1, fontSize: normalize(14), color: "#111827" },
  scrollContent: { paddingHorizontal: normalize(16), paddingBottom: normalize(40) },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: normalize(24) },
  actionCard: { flex: 1, backgroundColor: "#FFF", padding: normalize(16), borderRadius: normalize(12), borderWidth: 1, borderColor: "#F3F4F6", marginHorizontal: normalize(4) },
  actionIcon: { marginBottom: normalize(12) },
  actionText: { fontSize: normalize(13), fontWeight: "600", color: "#111827", lineHeight: normalize(18) },
  savedSection: { marginTop: normalize(8) },
  savedTitle: { fontSize: normalize(12), fontWeight: "bold", color: "#9CA3AF", marginBottom: normalize(12), letterSpacing: 0.5 },
  listContainer: { backgroundColor: "#FFF", borderRadius: normalize(12), borderWidth: 1, borderColor: "#F3F4F6", overflow: "hidden" },
  addressItem: { flexDirection: "row", alignItems: "center", padding: normalize(16), borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  lastItem: { borderBottomWidth: 0 },
  iconBox: { width: normalize(40), height: normalize(40), borderRadius: normalize(8), backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: normalize(16) },
  addressDetails: { flex: 1, paddingRight: normalize(12) },
  addressLabel: { fontSize: normalize(15), fontWeight: "bold", color: "#111827", marginBottom: normalize(4) },
  addressText: { fontSize: normalize(12), color: "#6B7280", lineHeight: normalize(18) },
  menuBtn: { padding: normalize(4) },
});