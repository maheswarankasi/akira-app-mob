import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import { products } from "../data/data";
import { normalize } from "../utils/responsive";
import ProductCard from "./ProductCard"; // தனி Component-ஐ Import செய்கிறோம்

// --- Category Tabs Data ---
const TABS = [
  { id: "all", labelKey: "tab_all", icon: "leaf", color: "#058A46" },
  {
    id: "cat_vegetables",
    labelKey: "tab_vegetables",
    icon: "carrot",
    color: "#F59E0B",
  },
  {
    id: "cat_fruits",
    labelKey: "tab_fruits",
    icon: "food-apple",
    color: "#EF4444",
  },
  {
    id: "cat_millets",
    labelKey: "tab_millets",
    icon: "barley",
    color: "#D97706",
  },
];

// --- Main Fresh Picks Component ---
export default function FreshPicksSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState("all");

  // --- இங்குதான் Filter Logic சரி செய்யப்பட்டுள்ளது ---
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    if (selectedTab === "all") {
      return products.slice(0, 4);
    }

    // "cat_vegetables" என்பதை "vegetables" என்று மாற்றி செக் செய்கிறோம்
    const rawCategory = selectedTab.replace("cat_", "");

    const filtered = products.filter(
      (p) =>
        p.categoryId === selectedTab ||
        p.category === rawCategory ||
        p.category === selectedTab,
    );

    return filtered.slice(0, 4);
  }, [selectedTab]);

  const getButtonText = () => {
    if (selectedTab === "all") {
      return t("view_all");
    }
    const tabObj = TABS.find((tObj) => tObj.id === selectedTab);
    const categoryName = tabObj ? t(tabObj.labelKey) : "";
    return `${t("view_all")} ${categoryName}`;
  };

  return (
    <View style={styles.container}>
      {/* Title & Subtitle */}
      <View style={styles.headerTitleContainer}>
        <Image
          source={require("../assets/images/fresh-picks.webp")}
          resizeMode="contain"
          style={{ width: normalize(200), height: normalize(80) }}
        />
        <Text
          style={[
            styles.subtitle,
            { fontSize: lang === "ta" ? normalize(14) : normalize(16) },
          ]}
        >
          {t("fresh_picks_subtitle")}
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabListContent}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item.id;
            return (
              <TouchableOpacity
                style={[styles.tabItem, isSelected && styles.tabItemSelected]}
                onPress={() => setSelectedTab(item.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.tabIconBg,
                    isSelected && styles.tabIconBgSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={normalize(40)}
                    color={isSelected ? "#058A46" : item.color}
                  />
                </View>
                <Text
                  style={[
                    styles.tabText,
                    isSelected && styles.tabTextSelected,
                    { fontSize: lang === "ta" ? normalize(11) : normalize(13) },
                  ]}
                >
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* --- Products Grid Rendering --- */}
      <View style={styles.productsGrid}>
        {displayProducts.length > 0 ? (
          displayProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <Text style={styles.noProductsText}>Products not found</Text>
        )}
      </View>

      {/* View All Button */}
      <TouchableOpacity
        style={styles.viewAllBtn}
        onPress={() => {
          const targetCategory = selectedTab === "all" ? null : selectedTab;
          navigation.navigate("AllCategoriesScreen", {
            initialCategory: targetCategory,
          });
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.viewAllBtnText,
            { fontSize: lang === "ta" ? normalize(13) : normalize(14) },
          ]}
        >
          {getButtonText()}
        </Text>
        <Ionicons name="chevron-forward" size={normalize(18)} color="#058A46" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: normalize(16),
    backgroundColor: "#FFF",
    marginTop: normalize(8),
  },
  headerTitleContainer: {
    alignItems: "center",
    paddingHorizontal: normalize(16),
    marginBottom: normalize(16),
  },
  subtitle: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: normalize(0),
  },

  // Tabs
  tabsContainer: {
    marginBottom: normalize(16),
  },
  tabListContent: {
    flexGrow: 1,
    justifyContent: "space-evenly",
  },
  tabItem: {
    alignItems: "center",
    marginHorizontal: normalize(8),
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    paddingBottom: normalize(8),
  },
  tabItemSelected: {
    borderBottomColor: "#FF204E",
  },
  tabIconBg: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(12),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabIconBgSelected: {
    borderColor: "#FF204E",
    backgroundColor: "#FFF",
  },
  tabText: {
    color: "#4B5563",
    fontWeight: "600",
  },
  tabTextSelected: {
    color: "#FF204E",
  },

  // Grid
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: normalize(16),
    justifyContent: "space-between",
  },
  noProductsText: {
    width: "100%",
    textAlign: "center",
    color: "#9CA3AF",
    marginVertical: normalize(20),
    fontSize: normalize(14),
  },

  // View All Button
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: normalize(8),
    paddingVertical: normalize(12),
    marginHorizontal: normalize(16),
    marginTop: normalize(8),
  },
  viewAllBtnText: {
    color: "#058A46",
    fontWeight: "bold",
    marginRight: normalize(4),
  },
});
