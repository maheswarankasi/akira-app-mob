import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { updateQuantity, addToCart } from "../store/cartSlice"; // addToCart-ஐ சேர்த்துள்ளோம்
import { normalize } from "../utils/responsive";
import ScheduleDeliveryModal from "../components/ScheduleDeliveryModal"; // Modal Component

export default function CartScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // RTK Store-ல் இருந்து Cart டேட்டாவை எடுக்கிறோம்
  const { items, totalQuantity, totalPrice } = useSelector(
    (state) => state.cart,
  );

  // Language Setup
  const { i18n } = useTranslation();
  const lang = i18n.language?.includes("ta") ? "ta" : "en";
  const isTa = lang === "ta";

  // Modal States
  const [isScheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [productToSchedule, setProductToSchedule] = useState(null);

  // Data Extraction Helper
  const getLocalText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  // Quantity மாற்றுவதற்கான லாஜிக்
  const handleQuantityChange = (productId, currentQty, type) => {
    const newQty = type === "increase" ? currentQty + 1 : currentQty - 1;
    dispatch(updateQuantity({ productId, quantity: newQty }));
  };

  // Schedule Modal-ஐ ஓபன் செய்வது
  const handleOpenSchedule = (product) => {
    setProductToSchedule(product);
    setScheduleModalVisible(true);
  };

  // Schedule செய்த டேட்டாவை Cart-ல் அப்டேட் செய்வது
  const handleScheduleSuccess = (scheduleData) => {
    if (productToSchedule) {
      // Quantity 0 என அனுப்பினால் ஏற்கனவே உள்ள கார்ட்டில் count ஏராமல் Schedule மட்டும் அப்டேட் ஆகும்
      dispatch(
        addToCart({
          product: productToSchedule,
          quantity: 0,
          schedule: scheduleData,
        })
      );
    }
    setScheduleModalVisible(false);
    setProductToSchedule(null);
  };

  // Cart காலியாக இருந்தால் காட்டும் திரை
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={normalize(24)} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isTa ? "கார்ட்" : "Cart"}</Text>
        </View>
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={normalize(80)} color="#CBD5E1" />
          <Text style={styles.emptyCartText}>
            {isTa ? "உங்கள் கார்ட் காலியாக உள்ளது!" : "Your cart is empty!"}
          </Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopNowBtnText}>
              {isTa ? "பொருட்களை வாங்க" : "Shop Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={normalize(24)} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isTa ? "கார்ட்" : "Cart"}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: normalize(40) }}
      >
        {/* --- Cart Items Card --- */}
        <View style={styles.cartCardWrapper}>
          <View style={styles.cartCardHeader}>
            <Text style={styles.brandTitle}>Pure & Natural</Text>
            <Text style={styles.itemCountText}>
              {totalQuantity} {isTa ? "பொருட்கள்" : "Items"}
            </Text>
          </View>

          {items.map((item, index) => {
            const product = item.product;
            const variant = product.variants?.[0] || {};
            const isLast = index === items.length - 1;
            const imageUrl = product.images?.[0] || product.imageURL;

            return (
              <View
                key={product.id}
                style={[styles.itemRow, !isLast && styles.borderBottom]}
              >
                {/* Image */}
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.itemImg}
                  resizeMode="contain"
                />

                {/* Product Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {getLocalText(product.name)}
                  </Text>
                  <Text style={styles.weightText}>
                    {getLocalText(variant.weight)} X {item.quantity}
                  </Text>

                  {/* Schedule Logic - Condition Check */}
                  {item.schedule ? (
                    // Schedule செய்யப்பட்டிருந்தால் (Deliver in...)
                    <TouchableOpacity
                      style={styles.scheduleRow}
                      onPress={() => handleOpenSchedule(product)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={normalize(12)}
                        color="#6B7280"
                      />
                      <Text style={styles.scheduleText}>
                        Schedule:{" "}
                        <Text style={styles.scheduleTime}>
                          {item.schedule.date?.dayLabel || item.schedule.date?.dateString} | {item.schedule.time?.label}
                        </Text>
                      </Text>
                      <Ionicons
                        name="pencil"
                        size={normalize(12)}
                        color="#F59E0B"
                        style={{ marginLeft: normalize(6) }}
                      />
                    </TouchableOpacity>
                  ) : (
                    // Schedule செய்யப்படவில்லை என்றால் பட்டன் காட்டும்
                    <TouchableOpacity
                      style={styles.scheduleActionBtn}
                      onPress={() => handleOpenSchedule(product)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="time-outline"
                        size={normalize(12)}
                        color="#058A46"
                      />
                      <Text style={styles.scheduleActionText}>
                        {isTa ? "நேரத்தைத் திட்டமிடு" : "Schedule"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Right Actions (Qty & Price) */}
                <View style={styles.actionCol}>
                  {/* Quantity Selector */}
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      onPress={() =>
                        handleQuantityChange(
                          product.id,
                          item.quantity,
                          "decrease",
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Ionicons
                        name="remove"
                        size={normalize(16)}
                        color="#FF204E"
                      />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleQuantityChange(
                          product.id,
                          item.quantity,
                          "increase",
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      <Ionicons
                        name="add"
                        size={normalize(16)}
                        color="#FF204E"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Pricing */}
                  <View style={styles.priceWrap}>
                    {variant.mrp ? (
                      <Text style={styles.mrpText}>₹{variant.mrp}</Text>
                    ) : null}
                    <Text style={styles.sellPrice}>₹{variant.price}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Add More Items Button */}
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => navigation.navigate("AllCategoriesScreen")}
          >
            <Ionicons name="add" size={normalize(18)} color="#FF204E" />
            <Text style={styles.addMoreText}>
              {isTa ? "மேலும் சேர்க்க" : "Add more items"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Bill Summary --- */}
        <View style={styles.billSummary}>
          <Text style={styles.billTitle}>
            {isTa ? "பட்டியல் விவரம்" : "Bill Details"}
          </Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              {isTa ? "மொத்தப் பொருட்களின் விலை" : "Item Total"}
            </Text>
            <Text style={styles.billVal}>₹{totalPrice}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              {isTa ? "டெலிவரி கட்டணம்" : "Delivery Fee"}
            </Text>
            <Text style={[styles.billVal, { color: "#058A46" }]}>FREE</Text>
          </View>

          <View style={[styles.billRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>
              {isTa ? "மொத்தம்" : "Grand Total"}
            </Text>
            <Text style={styles.grandTotalVal}>₹{totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* --- Schedule Modal --- */}
      <ScheduleDeliveryModal
        visible={isScheduleModalVisible}
        onClose={() => {
          setScheduleModalVisible(false);
          setProductToSchedule(null);
        }}
        onSuccess={handleScheduleSuccess}
      />

      {/* --- Bottom Checkout Bar --- */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>₹{totalPrice}</Text>
          <Text style={styles.checkoutTotalLabel}>TOTAL</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.8}>
          <Text style={styles.checkoutBtnText}>
            {isTa ? "பணம் செலுத்த" : "Proceed to Pay"}
          </Text>
          <Ionicons name="chevron-forward" size={normalize(18)} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === "ios" ? normalize(20) : normalize(20),
    paddingBottom: normalize(16),
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { paddingRight: normalize(16) },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#111827",
  },

  // Empty State
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: normalize(20),
  },
  emptyCartText: {
    fontSize: normalize(16),
    color: "#64748B",
    marginTop: normalize(16),
    marginBottom: normalize(24),
  },
  shopNowBtn: {
    backgroundColor: "#058A46",
    paddingHorizontal: normalize(32),
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
  },
  shopNowBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: normalize(16),
  },

  scrollArea: { flex: 1, padding: normalize(16) },

  // Cart Card Wrapper
  cartCardWrapper: {
    backgroundColor: "#FFF",
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "#38BDF8",
    padding: normalize(16),
    marginBottom: normalize(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: normalize(4),
    elevation: 2,
  },
  cartCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: normalize(12),
    marginBottom: normalize(12),
  },
  brandTitle: { fontSize: normalize(16), fontWeight: "bold", color: "#111827" },
  itemCountText: {
    fontSize: normalize(12),
    color: "#64748B",
    marginTop: normalize(4),
  },

  // Item Row
  itemRow: { flexDirection: "row", paddingVertical: normalize(12) },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  itemImg: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(8),
    backgroundColor: "#F8FAFC",
  },
  itemDetails: { flex: 1, marginLeft: normalize(12), justifyContent: "center" },
  itemName: {
    fontSize: normalize(14),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: normalize(4),
  },
  weightText: { fontSize: normalize(12), color: "#64748B" },

  // Schedule Indicator Text
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: normalize(8),
  },
  scheduleText: {
    fontSize: normalize(11),
    color: "#64748B",
    marginLeft: normalize(4),
  },
  scheduleTime: { 
    color: "#F59E0B", 
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationStyle: "dashed"
  },
  
  // Schedule Action Button (If Not Scheduled)
  scheduleActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: normalize(8),
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(4),
    alignSelf: "flex-start",
  },
  scheduleActionText: {
    fontSize: normalize(11),
    fontWeight: "600",
    color: "#058A46",
    marginLeft: normalize(4),
  },

  // Actions
  actionCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: normalize(8),
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF204E",
    borderRadius: normalize(20),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(4),
    backgroundColor: "#FFF",
  },
  qtyBtn: { paddingHorizontal: normalize(8) },
  qtyText: {
    fontSize: normalize(14),
    fontWeight: "bold",
    color: "#FF204E",
    marginHorizontal: normalize(6),
  },

  // Prices
  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: normalize(8),
  },
  mrpText: {
    fontSize: normalize(12),
    color: "#94A3B8",
    textDecorationLine: "line-through",
    marginRight: normalize(6),
  },
  sellPrice: { fontSize: normalize(15), fontWeight: "bold", color: "#10B981" },

  // Add More Button
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: normalize(16),
    borderWidth: 1,
    borderColor: "#FF204E",
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
  },
  addMoreText: {
    color: "#FF204E",
    fontSize: normalize(14),
    fontWeight: "500",
    marginLeft: normalize(6),
  },

  // Bill Summary
  billSummary: {
    backgroundColor: "#FFF",
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(20),
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  billTitle: {
    fontSize: normalize(16),
    fontWeight: "bold",
    marginBottom: normalize(16),
    color: "#111827",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(10),
  },
  billLabel: { color: "#64748B", fontSize: normalize(14) },
  billVal: { color: "#1E293B", fontSize: normalize(14), fontWeight: "500" },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: normalize(16),
    marginTop: normalize(8),
  },
  grandTotalLabel: {
    fontWeight: "bold",
    fontSize: normalize(16),
    color: "#111827",
  },
  grandTotalVal: {
    fontWeight: "bold",
    fontSize: normalize(16),
    color: "#111827",
  },

  // Checkout Bar
  checkoutBar: {
    backgroundColor: "#FFF",
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: Platform.OS === "ios" ? normalize(32) : normalize(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: normalize(4),
    elevation: 5,
  },
  checkoutTotal: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: "#111827",
  },
  checkoutTotalLabel: {
    fontSize: normalize(11),
    color: "#6B7280",
    marginTop: normalize(2),
  },
  checkoutBtn: {
    backgroundColor: "#FF204E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(14),
    borderRadius: normalize(10),
  },
  checkoutBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: normalize(16),
    marginRight: normalize(8),
  },
});