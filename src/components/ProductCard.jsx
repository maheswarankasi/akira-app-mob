import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../store/cartSlice';
import { normalize } from '../utils/responsive'; 

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes('ta') ? 'ta' : 'en';

  const cartItem = useSelector((state) => 
    state.cart.items.find(item => item.product.id === product.id)
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => dispatch(addToCart({ product, quantity: 1 }));
  const handleIncrement = () => dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity + 1 }));
  const handleDecrement = () => dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity - 1 }));

  const getLocalText = (textObj) => {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[lang] || textObj.en || '';
  };

  if (!product) return null;

  const productName = getLocalText(product.name);
  const subtitle = getLocalText(product.subtitle);
  const imageUrl = product.images?.[0] || product.imageURL;
  const variant = product.variants?.[0] || {};
  const weight = getLocalText(variant.weight) || '500g';
  const price = variant.price || 0;
  const mrp = variant.mrp || 0;
  
  const discount = variant.discountPercent 
    ? (lang === 'ta' ? `${variant.discountPercent}% தள்ளுபடி` : `${variant.discountPercent}% OFF`) 
    : (variant.discount || '');

  const handleImageClick = () => {
    navigation.navigate("ProductDetailsScreen", { productId: product.id });
  };

  const handleAiInfoClick = () => {
    navigation.navigate("ProductDetailsScreen", { 
      productId: product.id, 
      initialTab: 'ai_nutri_info' 
    });
  };

  return (
    <View style={styles.cardContainer}>
      
      {/* 1. Image Section */}
      <View style={styles.imageSection}>
        {/* --- Collapse ஆன பிரச்சனை இங்கு சரி செய்யப்பட்டுள்ளது --- */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={handleImageClick}
        >
          <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
        </TouchableOpacity>

        {/* Overlapping Add / Quantity Button */}
        <View style={styles.addButtonWrapper}>
          {cartQuantity === 0 ? (
            <TouchableOpacity 
              style={[
                styles.addBtnOutline, 
                { paddingHorizontal: lang === 'ta' ? normalize(14) : normalize(16) }
              ]} 
              onPress={handleAdd} 
              activeOpacity={0.7}
              hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
            >
              <Text style={[styles.addBtnOutlineText, { fontSize: lang === 'ta' ? normalize(14) : normalize(16) }]}>
                {t('add')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.qtyActionBtn} 
                onPress={handleDecrement}
                hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
              >
                <Ionicons name="remove" size={normalize(16)} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              
              <TouchableOpacity 
                style={styles.qtyActionBtn} 
                onPress={handleIncrement}
                hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
              >
                <Ionicons name="add" size={normalize(16)} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 2. Product Details Section */}
      <TouchableOpacity activeOpacity={0.9} onPress={handleImageClick} style={styles.detailsWrapper}>
        <Text style={styles.weightText}>{weight}</Text>
        
        <Text 
          style={[styles.productName, { fontSize: lang === 'ta' ? normalize(13) : normalize(15) }]} 
          numberOfLines={1}
        >
          {productName}
        </Text>
        
        {discount ? (
          <Text style={[styles.discountText, { fontSize: lang === 'ta' ? normalize(9) : normalize(11) }]}>
            {discount}
          </Text>
        ) : (
          <View style={{ height: normalize(16) }}/>
        )}
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{price}</Text>
          {mrp > 0 && <Text style={styles.mrpText}>₹{mrp}</Text>}
        </View>

        <Text 
          style={[
            styles.descText, 
            { 
              fontSize: lang === 'ta' ? normalize(11) : normalize(13),
              lineHeight: lang === 'ta' ? normalize(13) : normalize(15)
            }
          ]} 
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </TouchableOpacity>

      {/* 3. AI Nutritional Info Button */}
      <TouchableOpacity style={styles.aiButton} onPress={handleAiInfoClick} activeOpacity={0.7}>
        <View style={styles.aiButtonLeft}>
          <MaterialCommunityIcons name="magic-staff" size={normalize(14)} color="#058A46" />
          <Text 
            style={[styles.aiButtonText, { fontSize: lang === 'ta' ? normalize(10) : normalize(12) }]}
            numberOfLines={1}
          >
            {t('ai_nutri_info')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={normalize(12)} color="#058A46" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%', 
    backgroundColor: '#FFF',
    marginBottom: normalize(20),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#F3F4F6', 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.08,
    shadowRadius: normalize(4),
    elevation: 3, // Android-க்கான Shadow
  },
  
  imageSection: {
    position: 'relative',
    paddingBottom: normalize(14), 
    marginBottom: normalize(10),
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1, 
    borderTopLeftRadius: normalize(12),
    borderTopRightRadius: normalize(12),
    backgroundColor: '#F9FAFB',
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: 0, 
    right: normalize(8),
    zIndex: 10,
    elevation: 3, 
  },
  
  addBtnOutline: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#058A46',
    borderRadius: normalize(8),
    paddingVertical: normalize(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(2),
    elevation: 2,
  },
  addBtnOutlineText: {
    color: '#058A46',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#058A46',
    borderRadius: normalize(6),
    height: normalize(30),
    paddingHorizontal: normalize(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(2),
    elevation: 2,
  },
  qtyActionBtn: {
    paddingHorizontal: normalize(6),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: normalize(16),
    minWidth: normalize(16),
    textAlign: 'center',
  },

  detailsWrapper: {
    paddingHorizontal: normalize(8),
  },
  weightText: {
    fontSize: normalize(13),
    color: '#9CA3AF',
    marginBottom: normalize(4),
  },
  productName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: normalize(4),
    minHeight: normalize(18), 
  },
  discountText: {
    fontWeight: 'bold',
    color: '#FF4500', 
    marginBottom: normalize(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: normalize(6),
  },
  priceText: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    color: '#111827',
  },
  mrpText: {
    fontSize: normalize(11),
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: normalize(6),
    marginBottom: normalize(2),
  },
  descText: {
    color: '#6B7280',
    marginBottom: normalize(10),
    minHeight: normalize(28),
  },

  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#F0FDF4",
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(8),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  aiButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  aiButtonText: {
    color: '#058A46',
    fontWeight: '600',
    marginLeft: normalize(4),
    flexShrink: 1, 
  },
});