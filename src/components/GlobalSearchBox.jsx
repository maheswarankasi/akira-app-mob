import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Responsive மற்றும் i18n-ஐ import செய்கிறோம்
import { useTranslation } from "react-i18next";
import { normalize } from "../utils/responsive";

export default function GlobalSearchBox({
  onSearch,
  // Parent Component-ல் இருந்து t('search') என அனுப்புவது சிறந்தது
  placeholder = "Search...", 
}) {
  const [searchText, setSearchText] = useState("");
  
  // தற்போதைய மொழியைக் கண்டறிகிறோம்
  const { i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  // Debounce Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // 500ms கழித்து, Parent Component-க்கு டேட்டாவை அனுப்புகிறோம்
      if (onSearch) {
        onSearch(searchText);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, onSearch]); 

  return (
    <View style={styles.searchSection}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={normalize(20)}
          color="#6B7280"
          style={styles.searchIcon}
        />

        <TextInput
          style={[
            styles.searchInput,
            // தமிழுக்கு ஏற்ப Font Size-ஐ டைனமிக் ஆக மாற்றுகிறோம்
            { fontSize: lang === "ta" ? normalize(13) : normalize(15) }
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Text இருந்தால் Close button காட்டும் */}
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={{ marginRight: normalize(8) }}
            hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
          >
            <Ionicons name="close-circle" size={normalize(20)} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.micIconWrapper}
          hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
        >
          <Ionicons name="mic-outline" size={normalize(24)} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16), 
    paddingTop: normalize(16),
    zIndex: 10
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    height: normalize(50),
    
    // (Optional) லேசான ஷேடோ கொடுத்தால் Search Bar இன்னும் அழகாகத் தெரியும்
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.05,
    shadowRadius: normalize(4),
    elevation: 2, 
  },
  searchIcon: {
    marginRight: normalize(8),
  },
  searchInput: {
    flex: 1,
    color: "#111827",
  },
  micIconWrapper: {
    paddingLeft: normalize(10),
    borderLeftWidth: 1,
    borderLeftColor: "#F3F4F6",
    marginLeft: normalize(2),
  },
});