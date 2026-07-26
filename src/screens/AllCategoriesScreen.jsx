import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Updated safe-area import
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { products } from "../data/data";
import { addToCart, updateQuantity } from "../store/cartSlice";
import GlobalCartBanner from "../components/GlobalCartBanner";
import { normalize } from "../utils/responsive";
import ProductCard from "../components/ProductCard";

// --- Single Product Card Component (Right Side) ---
const CategoryProductCard = ({ product, lang, t }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.product.id === product.id),
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const getLocalText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  const productName = getLocalText(product.name);
  const subtitle = getLocalText(product.subtitle);
  const imageUrl = product.images?.[0] || product.imageURL;
  const variant = product.variants?.[0] || {};

  const handleProductClick = () => {
    navigation.navigate("ProductDetailsScreen", { productId: product.id });
  };

  const handleAdd = () => dispatch(addToCart({ product, quantity: 1 }));
  const handleIncrement = () =>
    dispatch(
      updateQuantity({ productId: product.id, quantity: cartQuantity + 1 }),
    );
  const handleDecrement = () =>
    dispatch(
      updateQuantity({ productId: product.id, quantity: cartQuantity - 1 }),
    );

  return (
    <View style={styles.productCard}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleProductClick}
        style={styles.imageWrapper}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />

        <View style={styles.addBtnContainer}>
          {cartQuantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtnOutline}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={handleDecrement}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={normalize(14)} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={handleIncrement}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={normalize(14)} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleProductClick}
        style={styles.productDetails}
      >
        <Text style={styles.productWeight}>{getLocalText(variant.weight)}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>

        {variant.discountPercent ? (
          <Text style={styles.productDiscount}>
            {variant.discountPercent}% OFF
          </Text>
        ) : (
          <Text style={styles.productDiscount}> </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{variant.price}</Text>
          {variant.mrp ? (
            <Text style={styles.productMrp}>₹{variant.mrp}</Text>
          ) : null}
        </View>

        <Text style={styles.productDesc} numberOfLines={2}>
          {subtitle}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.aiBanner}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ProductDetailsScreen", {
            productId: product.id,
            initialTab: "ai_nutri_info",
          })
        }
      >
        <MaterialCommunityIcons
          name="magic-staff"
          size={normalize(14)}
          color="#058A46"
        />
        <Text style={styles.aiBannerText}>
          {lang === "ta" ? "AI ஊட்டச்சத்து" : "AI Nutritional Info"}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={normalize(12)}
          color="#058A46"
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>
    </View>
  );
};

// --- Main Screen Component ---
export default function AllCategoriesScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // <-- Puthusu
  const { i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";

  // Home Screen-ல் இருந்து வரும் Category ID
  const { initialCategory } = route.params || {};

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (!map.has(p.categoryId)) {
        map.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName,
          image: p.images?.[0] || "",
        });
      }
    });
    return Array.from(map.values());
  }, []);

  // initialCategory இருந்தால் அதை செட் செய்ய வேண்டும், இல்லையென்றால் முதல் Category.
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || categories[0]?.id || null,
  );

  // ஒருவேளை திரைக்கு வரும்போதெல்லாம் Params மாறினால் அப்டேட் செய்ய
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const getLocalText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-back"
              size={normalize(24)}
              color="#111827"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {lang === "ta" ? "அனைத்து வகைகள்" : "All Categories"}
          </Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons
            name="search-outline"
            size={normalize(24)}
            color="#111827"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarContent}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryImgBg,
                      isSelected && styles.categoryImgBgSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.categoryImg}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {getLocalText(item.name)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.rightContent}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.rowWrapper}
            renderItem={({ item }) => (
              // <CategoryProductCard product={item} lang={lang} />
              <ProductCard product={item} />
            )}
          />
        </View>
      </View>

      <View style={styles.bottomFixedContainer}>
        <GlobalCartBanner />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'ios' ? normalize(10) : normalize(20),
    paddingBottom: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: normalize(12) },
  headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#111827' },
  searchBtn: { padding: normalize(4) },
  mainLayout: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: normalize(85),
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sidebarContent: { paddingVertical: normalize(16) },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(8),
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  categoryItemSelected: {
    borderLeftColor: '#058A46',
    backgroundColor: '#FFF',
  },
  categoryImgBg: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(8),
    overflow: 'hidden'
  },
  categoryImgBgSelected: {
    backgroundColor: '#E0F2FE', 
  },
  categoryImg: { width: '80%', height: '80%' },
  categoryText: {
    fontSize: normalize(10),
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#111827',
    fontWeight: 'bold',
  },
  rightContent: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  productsGrid: {
    padding: normalize(12),
    paddingBottom: normalize(100), 
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  productCard: {
    width: '48%', 
    backgroundColor: '#FFF',
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  imageWrapper: {
    backgroundColor: '#F9FAFB',
    height: normalize(120),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  addBtnContainer: {
    position: 'absolute',
    bottom: normalize(-12),
    right: normalize(8),
    zIndex: 10,
  },
  addBtnOutline: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#058A46',
    borderRadius: normalize(6),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(2),
    elevation: 2,
  },
  addBtnText: {
    color: '#058A46',
    fontWeight: 'bold',
    fontSize: normalize(12),
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#058A46',
    borderRadius: normalize(6),
    height: normalize(28),
    paddingHorizontal: normalize(4),
  },
  qtyBtn: {
    paddingHorizontal: normalize(6),
    height: '100%',
    justifyContent: 'center',
  },
  qtyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: normalize(12),
    minWidth: normalize(16),
    textAlign: 'center',
  },
  productDetails: {
    paddingHorizontal: normalize(10),
    paddingTop: normalize(18), 
    paddingBottom: normalize(10),
  },
  productWeight: {
    fontSize: normalize(10),
    color: '#6B7280',
    marginBottom: normalize(2),
  },
  productName: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: '#111827',
    marginBottom: normalize(4),
    minHeight: normalize(32),
  },
  productDiscount: {
    fontSize: normalize(10),
    color: '#FF3B30',
    fontWeight: 'bold',
    marginBottom: normalize(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: normalize(4),
  },
  productPrice: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#111827',
  },
  productMrp: {
    fontSize: normalize(11),
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: normalize(6),
  },
  productDesc: {
    fontSize: normalize(10),
    color: '#9CA3AF',
    minHeight: normalize(26),
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(10),
  },
  aiBannerText: {
    color: '#058A46',
    fontSize: normalize(10),
    fontWeight: '600',
    marginLeft: normalize(4),
  },
  bottomFixedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? normalize(16) : 0,
  }
});