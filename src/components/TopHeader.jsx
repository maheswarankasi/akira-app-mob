import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  Text,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

// --- Redux Imports ---
import { useDispatch, useSelector } from "react-redux";
import { setCurrentShop } from "../store/shopSlice";

// 1. Dynamic Themes
const THEMES = {
  pure_natural: {
    headerBg: "#F3F9EE",
    activeSectionBg: "#03B75E",
    inactiveBorder: "#03B75E",
    micIcon: "#EF4444",
  },
  nutri_kitchen: {
    headerBg: "#FFF7ED",
    activeSectionBg: "#E6D5B8",
    inactiveBorder: "#8B5A2B",
    micIcon: "#8B5A2B",
  },
  craft_village: {
    headerBg: "#F9FAFB",
    activeSectionBg: "#D1D5DB",
    inactiveBorder: "#4B5563",
    micIcon: "#4B5563",
  },
};

// 2. Smooth Outward Curve Component
const OutwardCurve = ({ side, activeBg, headerBg }) => (
  <View
    style={[
      styles.curveContainer,
      side === "left" ? { left: -19 } : { right: -19 },
      { backgroundColor: activeBg },
    ]}
  >
    <View
      style={[
        styles.curveChild,
        { backgroundColor: headerBg },
        side === "left" ? { left: -21 } : { right: -21 },
      ]}
    />
  </View>
);

export default function TopHeader({ onTabChange }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  const activeTab = useSelector((state) => state.shop?.currentShop) || "pure_natural";
  const theme = THEMES[activeTab];

  // --- States for Address Handling ---
  const [currentAddress, setCurrentAddress] = useState("Fetching address...");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // i18n மொழிமாற்றத்திற்கு ஏற்ப Text-ஐ எடுக்கும் Function
  const getLocalText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en || "";
  };

  // ஸ்கிரீனுக்கு வரும்போதெல்லாம் டேட்டாவை Refresh செய்ய
  useFocusEffect(
    useCallback(() => {
      fetchSavedAddress();
    }, [lang])
  );

  const fetchSavedAddress = async () => {
    try {
      const phone = await AsyncStorage.getItem("currentUserPhone");
      if (!phone) {
        setCurrentAddress("Please log in");
        return;
      }

      const storedProfile = await AsyncStorage.getItem(`userProfile_${phone}`);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);

        if (parsedProfile.addresses && parsedProfile.addresses.length > 0) {
          setSavedAddresses(parsedProfile.addresses);

          // கடைசியாகப் பயன்படுத்திய முகவரி உள்ளதா எனப் பார்க்கிறோம், இல்லையென்றால் முதல் முகவரி
          let activeAddr = parsedProfile.addresses.find(
            (a) => a.id === parsedProfile.lastUsedAddressId
          );
          
          if (!activeAddr) {
            activeAddr = parsedProfile.addresses[0];
          }

          setAddressState(activeAddr);
        } else {
          setCurrentAddress("No saved addresses");
          setAddressLabel(t("lbl_home") || "Home");
          setSavedAddresses([]);
        }
      }
    } catch (error) {
      console.log("Error fetching address from storage: ", error);
      setCurrentAddress("Error loading address");
    }
  };

  const setAddressState = (addr) => {
    setSelectedAddressId(addr.id);
    if (addr.label) setAddressLabel(t(addr.label));
    
    const fullAddr = getLocalText(addr.fullAddress);
    const streetAddr = getLocalText(addr.street);
    
    setCurrentAddress(fullAddr || streetAddr || "Address details not available");
  };

  // Dropdown-ல் ஒரு முகவரியை தேர்ந்தெடுக்கும்போது...
  const handleSelectAddress = async (addr) => {
    setAddressState(addr);
    setIsDropdownVisible(false);

    try {
      const phone = await AsyncStorage.getItem("currentUserPhone");
      const storedProfile = await AsyncStorage.getItem(`userProfile_${phone}`);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        
        // தேர்ந்தெடுத்த முகவரியை "கடைசியாகப் பயன்படுத்தியதாக" (lastUsed) சேமிக்கிறோம்
        parsedProfile.lastUsedAddressId = addr.id;
        await AsyncStorage.setItem(`userProfile_${phone}`, JSON.stringify(parsedProfile));
      }
    } catch (error) {
      console.log("Error saving last used address:", error);
    }
  };

  const handleTabPress = (tabId) => {
    dispatch(setCurrentShop(tabId));
    if (onTabChange) onTabChange(tabId);
  };

  // Label-க்கு ஏற்ற Icon
  const getIconForLabel = (labelKey) => {
    switch (labelKey) {
      case "lbl_home": return "home-outline";
      case "lbl_work": return "briefcase-outline";
      case "lbl_gym": return "barbell-outline";
      default: return "location-outline";
    }
  };

  // --- Reusable Tab Render Function ---
  const renderTab = (tabId, activeImage, inactiveImage) => {
    const isActive = activeTab === tabId;

    if (isActive) {
      return (
        <TouchableOpacity
          style={[styles.tab, styles.activeTab, { backgroundColor: theme.activeSectionBg }]}
          onPress={() => handleTabPress(tabId)}
          activeOpacity={0.9}
        >
          <OutwardCurve side="left" activeBg={theme.activeSectionBg} headerBg={theme.headerBg} />
          <OutwardCurve side="right" activeBg={theme.activeSectionBg} headerBg={theme.headerBg} />
          <Image source={activeImage} style={styles.tabImage} resizeMode="contain" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.tab, styles.inactiveTabContainer]}
        onPress={() => handleTabPress(tabId)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.inactiveBorder, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBorderWrapper}
        >
          <View style={styles.inactiveInner}>
            <Image source={inactiveImage} style={styles.tabImage} resizeMode="contain" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBg }]}>
      <View style={[styles.topContainer, { backgroundColor: theme.headerBg }]}>
        
        {/* --- Location Section with Dropdown Trigger --- */}
        <View style={styles.locationWrapper}>
          <TouchableOpacity 
            style={styles.locationTitleRow} 
            activeOpacity={0.7}
            onPress={() => savedAddresses.length > 0 && setIsDropdownVisible(true)}
          >
            <Text style={styles.locationTitle}>{addressLabel}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <Text style={styles.addressText} numberOfLines={1}>
            {currentAddress}
          </Text>
        </View>

        {/* --- Navigation Tabs --- */}
        <View style={styles.tabsContainer}>
          {renderTab("pure_natural", require("../assets/images/pure-natural-active.png"), require("../assets/images/pure-natural-inactive.png"))}
          {renderTab("nutri_kitchen", require("../assets/images/nutri-kitchen-active.png"), require("../assets/images/nutri-kitchen-inactive.png"))}
          {renderTab("craft_village", require("../assets/images/craft-village-inactive.png"), require("../assets/images/craft-village-inactive.png"))}
        </View>
      </View>

      {/* --- Address Selection Dropdown Modal --- */}
      <Modal visible={isDropdownVisible} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownHeaderTitle}>
              {lang === "ta" ? "முகவரியைத் தேர்ந்தெடுக்கவும்" : "Select an Address"}
            </Text>
            
            <FlatList
              data={savedAddresses}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.dropdownItem, 
                    selectedAddressId === item.id && styles.dropdownItemSelected
                  ]} 
                  onPress={() => handleSelectAddress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownIconBox}>
                    <Ionicons 
                      name={getIconForLabel(item.label)} 
                      size={20} 
                      color={selectedAddressId === item.id ? "#058A46" : "#4B5563"} 
                    />
                  </View>
                  <View style={styles.dropdownTextContainer}>
                    <Text style={[
                      styles.dropdownItemLabel,
                      selectedAddressId === item.id && { color: "#058A46" }
                    ]}>
                      {t(item.label || "lbl_home")}
                    </Text>
                    <Text style={styles.dropdownItemAddress} numberOfLines={2}>
                      {getLocalText(item.fullAddress)}
                    </Text>
                  </View>
                  {selectedAddressId === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#058A46" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { paddingTop: Platform.OS === "android" ? 40 : 0 },
  topContainer: { paddingHorizontal: 16, paddingTop: 10 },
  locationWrapper: { marginBottom: 16 },
  locationTitleRow: { flexDirection: "row", alignItems: "center" },
  locationTitle: { fontSize: 18, fontWeight: "700", color: "#111827", textTransform: "capitalize" },
  addressText: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  tabsContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 },
  tab: { flex: 1, height: 55, marginHorizontal: 4 },
  activeTab: { justifyContent: "center", alignItems: "center", borderTopLeftRadius: 16, borderTopRightRadius: 16, zIndex: 1 },
  inactiveTabContainer: { zIndex: 2 },
  gradientBorderWrapper: { flex: 1, paddingTop: 1.5, paddingHorizontal: 1.5, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  inactiveInner: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 14.5, borderTopRightRadius: 14.5, borderBottomLeftRadius: 14.5, borderBottomRightRadius: 14.5, justifyContent: "center", alignItems: "center" },
  tabImage: { width: "80%", height: 35 },
  curveContainer: { position: "absolute", bottom: 0, width: 20, height: 20, overflow: "hidden" },
  curveChild: { position: "absolute", top: -20, width: 40, height: 40, borderRadius: 20 },
  
  // Modal Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  dropdownContainer: {
    backgroundColor: "#FFF",
    marginTop: Platform.OS === 'ios' ? 110 : 90,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  dropdownHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#F0FDF4", // மிதமான பச்சை நிறம்
  },
  dropdownIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dropdownTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  dropdownItemLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  dropdownItemAddress: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});