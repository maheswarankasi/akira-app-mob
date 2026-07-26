import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { normalize } from '../utils/responsive';

export default function GlobalCartBanner() {
  const navigation = useNavigation();
  
  // 't' ஃபங்ஷன் மற்றும் தற்போதைய மொழியை எடுக்கிறோம்
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.includes('ta') ? 'ta' : 'en';
  
  // RTK Store-ல் இருந்து டேட்டாவை எடுக்கிறோம்
  const { items, totalQuantity } = useSelector((state) => state.cart);

  if (totalQuantity === 0) return null;

  const previewImages = items.slice(0, 3).map(item => item.product.images?.[0] || item.product.imageURL);

  return (
    <TouchableOpacity 
      style={styles.cartBanner} 
      activeOpacity={0.9} 
      onPress={() => navigation.navigate("CartScreen")}
    >
      <View style={styles.bannerLeft}>
        <MaterialCommunityIcons name="truck-delivery-outline" size={normalize(24)} color="#FFF" />
        {/* தமிழுக்கு ஏற்றவாறு Font Size டைனமிக் ஆக மாறுபடும் */}
        <Text 
          style={[
            styles.bannerTitle, 
            { fontSize: lang === 'ta' ? normalize(13) : normalize(16) }
          ]}
        >
          {t('free_delivery')}
        </Text>
      </View>

      <View style={styles.bannerRight}>
        <View style={styles.cartTextCol}>
          <Text 
            style={[
              styles.cartLabel, 
              { fontSize: lang === 'ta' ? normalize(12) : normalize(14) }
            ]}
          >
            {t('cart')}
          </Text>
          <Text 
            style={[
              styles.itemsCount, 
              { fontSize: lang === 'ta' ? normalize(10) : normalize(11) }
            ]}
          >
            {totalQuantity} {t('items')}
          </Text>
        </View>

        <View style={styles.imagesWrap}>
          {previewImages.map((img, index) => (
            <Image 
              key={index} 
              source={{ uri: img }} 
              style={[
                styles.cartImg, 
                { zIndex: 3 - index, left: index * normalize(-12) }
              ]} 
            />
          ))}
        </View>
        <Ionicons name="chevron-forward" size={normalize(20)} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartBanner: {
    backgroundColor: '#03B75E',
    marginHorizontal: normalize(16),
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(10),
    // லேசான ஷேடோ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: 3, 
  },
  bannerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1, // டெக்ஸ்ட் முட்டாமல் இருக்க
  },
  bannerTitle: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    marginLeft: normalize(8),
    flexShrink: 1, // பெரிய வார்த்தையாக இருந்தால் wrap ஆக
  },
  bannerRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cartTextCol: { 
    alignItems: 'flex-end', 
    marginRight: normalize(8) 
  },
  cartLabel: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
  itemsCount: { 
    color: '#D1FAE5' 
  },
  imagesWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    position: 'relative', 
    width: normalize(45), 
    height: normalize(28), 
    marginRight: normalize(8) 
  },
  cartImg: { 
    width: normalize(28), 
    height: normalize(28), 
    borderRadius: normalize(14), 
    borderWidth: 2, 
    borderColor: '#03B75E', 
    backgroundColor: '#FFF', 
    position: 'absolute' 
  }
});