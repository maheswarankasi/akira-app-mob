import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next"; // Global Translation Hook

import { products } from "../data/data";
import GlobalSearchBox from "./GlobalSearchBox";
import { normalize } from "../utils/responsive"; // Responsive Helper

const { width } = Dimensions.get("window");

export default function PureNaturalContent() {
  const navigation = useNavigation();
  
  // --- Language & Translation Setup ---
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";
  const isTa = lang === "ta";

  const [randomProducts, setRandomProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (products && products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setRandomProducts(selected);
    }
  }, []);

  // Data Extraction Helper for multi-language object
  const getLocalText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  // Search Filter
  const handleSearchResults = (text) => {
    setSearchQuery(text); 

    if (text.trim().length > 0) {
      setIsSearching(true);
      const lowercasedFilter = text.toLowerCase();

      const results = products.filter((item) => {
        const enName = item.name?.en?.toLowerCase() || item.name?.toLowerCase() || "";
        const taName = item.name?.ta || "";
        return enName.includes(lowercasedFilter) || taName.includes(text);
      });

      setFilteredProducts(results);
    } else {
      setIsSearching(false);
      setFilteredProducts([]);
    }
  };

  // --- Dynamic Styles ---
  const dynamicStyles = {
    cardTitle: {
      fontSize: normalize(isTa ? 10 : 12), // தமிழுக்கு ஏற்ற அளவு
      lineHeight: normalize(isTa ? 16 : 14), // தமிழுக்கு அதிக இடைவெளி
    },
    featureText: {
      fontSize: normalize(isTa ? 12 : 15),
      lineHeight: normalize(isTa ? 16 : 14),
    },
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/pure-nature-header.webp")}
        style={styles.bannerBackground}
        resizeMode="cover"
      >
        {/* 1. Reusable Search Box */}
        <GlobalSearchBox
          onSearch={handleSearchResults}
          placeholder={t("searchPlaceholder")} // i18n Translation
        />

        {/* 2. Conditional Rendering */}
        {isSearching ? (
          <ScrollView
            style={styles.searchResultsContainer}
            contentContainerStyle={styles.searchResultsGrid}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, { marginBottom: normalize(16) }]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("ProductDetailsScreen", {
                      productId: item.id,
                    })
                  }
                >
                  <Text
                    style={[styles.cardTitle, dynamicStyles.cardTitle]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {getLocalText(item.name)}
                  </Text>
                  <Image
                    source={{
                      uri: item.images ? item.images[0] : item.imageURL,
                    }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={normalize(14)} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResultsText}>
                {t("noProducts")} "{searchQuery}"
              </Text>
            )}
          </ScrollView>
        ) : (
          <View>
            <View style={styles.spacer} />

            <View style={styles.cardsContainer}>
              {randomProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("ProductDetailsScreen", {
                      productId: item.id,
                    })
                  }
                >
                  <Text
                    style={[styles.cardTitle, dynamicStyles.cardTitle]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {getLocalText(item.name)}
                  </Text>
                  <Image
                    source={{
                      uri: item.images ? item.images[0] : item.imageURL,
                    }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={normalize(14)} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.featuresContainer}>
              <FeatureItem text={t("chemFree")} textStyle={dynamicStyles.featureText} />
              <View style={styles.divider} />
              <FeatureItem text={t("sustainable")} textStyle={dynamicStyles.featureText} />
              <View style={styles.divider} />
              <FeatureItem text={t("healthBen")} textStyle={dynamicStyles.featureText} />
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

// Sub-component for features
const FeatureItem = ({ text, textStyle }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={normalize(30)} color="#8DAD62" />
    <Text style={[styles.featureText, textStyle]}>{text}</Text>
  </View>
);

// --- Responsive Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#058A46",
    borderBottomLeftRadius: normalize(24),
    borderBottomRightRadius: normalize(24),
    overflow: "hidden",
    marginTop: normalize(-2),
    zIndex: -2,
    width: "100%",
  },
  searchResultsContainer: {
    backgroundColor: "#F3F9EE",
    minHeight: normalize(400),
    paddingTop: normalize(20),
  },
  searchResultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingHorizontal: normalize(10),
    paddingBottom: normalize(20),
  },
  noResultsText: {
    textAlign: "center",
    marginTop: normalize(40),
    fontSize: normalize(16),
    color: "#4B5563",
    width: "100%",
  },
  bannerBackground: {
    width: "100%",
    minHeight: normalize(400),
  },
  spacer: {
    height: normalize(180),
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: normalize(25),
    marginTop: "15%",
  },
  card: {
    backgroundColor: "#E8F5E9",
    width: (width - normalize(48)) / 3.5,
    aspectRatio: 0.7,
    borderRadius: normalize(12),
    padding: normalize(8),
    alignItems: "center",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
  },
  cardTitle: {
    fontWeight: "700",
    color: "#058A46",
    textAlign: "center",
    marginBottom: normalize(8),
    height: normalize(32),
  },
  cardImage: {
    width: "100%",
    height: "50%",
    borderRadius: normalize(50),
  },
  arrowContainer: {
    position: "absolute",
    bottom: normalize(10),
    right: normalize(6),
    backgroundColor: "#111827",
    borderRadius: normalize(12),
    width: normalize(20),
    height: normalize(20),
    justifyContent: "center",
    alignItems: "center",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: normalize(32),
    marginBottom: normalize(24),
    paddingHorizontal: normalize(16),
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  featureText: {
    color: "#A7F3D0",
    marginLeft: normalize(5),
    textAlign: "left",
  },
  divider: {
    width: 1,
    height: normalize(24),
    backgroundColor: "#A7F3D0",
    opacity: 0.4,
  },
});