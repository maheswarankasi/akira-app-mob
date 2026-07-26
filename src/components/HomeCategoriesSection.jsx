import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { normalize } from "../utils/responsive";

// Product Data-ஐ Import செய்கிறோம்
import { products } from "../data/data";

// --- Categories Base Data (Images நீக்கப்பட்டுவிட்டன) ---
const CATEGORIES_BASE = [
  { id: "cat_vegetables", labelKey: "cat_vegetables", isWide: true },
  { id: "cat_fruits", labelKey: "cat_fruits", isWide: true },
  { id: "cat_millets", labelKey: "cat_millets", isWide: false },
  { id: "cat_flours", labelKey: "cat_flours", isWide: false }, // labelKey உங்கள் i18n-க்கு ஏற்றவாறு செக் செய்யவும்
  { id: "cat_oil_ghee", labelKey: "cat_oil_ghee", isWide: false },
  { id: "cat_pickles", labelKey: "cat_pickles", isWide: false },
  { id: "cat_dals", labelKey: "cat_dals", isWide: false },
  { id: "cat_jaggery", labelKey: "cat_jaggery", isWide: false },
  { id: "cat_snacks", labelKey: "cat_snacks", isWide: false },
];

export default function HomeCategoriesSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";
  const navigation = useNavigation();

  // --- Random Product Image Logic ---
  // ஒவ்வொரு Category-க்கும் அதன் products-ல் இருந்து ஒரு Random Image-ஐ எடுக்கிறோம்
  const categoriesWithImages = useMemo(() => {
    return CATEGORIES_BASE.map((category) => {
      // 1. இந்த Category-க்குரிய Products-ஐ மட்டும் Filter செய்கிறோம்
      const categoryProducts = products.filter((p) => p.categoryId === category.id);
      
      let randomImage = null;
      
      // 2. Products இருந்தால், அதில் ஒன்றை Random ஆகத் தேர்ந்தெடுக்கிறோம்
      if (categoryProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryProducts.length);
        const randomProduct = categoryProducts[randomIndex];
        randomImage = randomProduct.images?.[0] || randomProduct.imageURL;
      }

      return {
        ...category,
        image: randomImage,
      };
    });
  }, []); // Component Mount ஆகும்போது ஒருமுறை மட்டும் Random Image செட் ஆகும்

  const handleCategoryPress = (categoryId) => {
    navigation.navigate("AllCategoriesScreen", { initialCategory: categoryId });
  };

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.sectionTitle, 
          { fontSize: lang === "ta" ? normalize(16) : normalize(18) }
        ]}
      >
        {t("all_categories_title") || "All Categories"}
      </Text>

      <View style={styles.gridContainer}>
        {categoriesWithImages.map((item, index) => {
          const cardStyle = item.isWide ? styles.wideCard : styles.smallCard;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemWrapper,
                { width: item.isWide ? "48%" : "30%" },
              ]}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(item.id)}
            >
              <View style={[styles.imageBg, cardStyle]}>
                {/* Random Image இருந்தால் காட்டும், இல்லையென்றால் காலியாக இருக்கும் */}
                {item.image ? (
                  <Image
                    source={{ uri: item.image }} 
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.noImgText}>No Img</Text>
                )}
              </View>
              
              {/* தமிழ் மற்றும் ஆங்கிலத்திற்கு ஏற்ப Responsive Text Size */}
              <Text 
                style={[
                  styles.categoryText, 
                  { 
                    fontSize: lang === "ta" ? normalize(12) : normalize(14),
                    lineHeight: lang === "ta" ? normalize(12) : normalize(14)
                  }
                ]} 
                numberOfLines={2}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    backgroundColor: "#FFF",
    marginTop: normalize(8),
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: normalize(16),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemWrapper: {
    alignItems: "center",
    marginBottom: normalize(16),
  },
  imageBg: {
    backgroundColor: "#F0FDF4", 
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(8),
    width: "100%",
    
    // லேசான ஷேடோ (Product Card போலவே)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(1) },
    shadowOpacity: 0.05,
    shadowRadius: normalize(2),
    elevation: 1, 
  },
  wideCard: {
    aspectRatio: 2.2, 
  },
  smallCard: {
    aspectRatio: 1, 
  },
  categoryImage: {
    // உண்மையான Product Images என்பதால் கொஞ்சம் பெரிதாக (80%) வைக்கப்பட்டுள்ளது
    width: "80%",
    height: "80%",
  },
  noImgText: {
    fontSize: normalize(8),
    color: "#9CA3AF",
  },
  categoryText: {
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
});