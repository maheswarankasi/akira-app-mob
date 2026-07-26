import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; 
import { useSelector } from "react-redux";

// Responsive Helper
import { normalize } from "../utils/responsive";

export default function LocationScreen({ route, navigation }) {
  const { phoneNumber, fromManageAddress } = route.params || {};
  const { t } = useTranslation(); 

  const currentLang = useSelector((state) => state.language.language);
  const isTamil = currentLang === "ta";

  const [location, setLocation] = useState(null);
  const [addressText, setAddressText] = useState(t("fetching_location"));
  const [loading, setLoading] = useState(true);
  const [addressObj, setAddressObj] = useState(null);

  useEffect(() => {
    let isMounted = true; 

    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          if (isMounted) {
            setLoading(false);
            navigation.navigate("AddressDetails", {
              phoneNumber,
              locationData: null,
              addressText: "",
              addressObj: null,
              fromManageAddress: fromManageAddress 
            });
          }
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        
        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }

        let geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode.length > 0 && isMounted) {
          const addr = geocode[0];
          setAddressObj(addr); 
          setAddressText(
            `${addr.name ? addr.name + ", " : ""}${addr.street ? addr.street + ", " : ""}${addr.city || addr.subregion || ""}, ${addr.region || ""} ${addr.postalCode || ""}`
          );
        }

        if (isMounted) setLoading(false);

      } catch (error) {
        console.log("Location Fetch Error: ", error);
        if (isMounted) {
          setLoading(false);
          navigation.navigate("AddressDetails", {
            phoneNumber,
            locationData: null,
            addressText: "",
            addressObj: null,
            fromManageAddress: fromManageAddress
          });
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []); 

  const handleConfirmLocation = () => {
    navigation.navigate("AddressDetails", {
      phoneNumber,
      locationData: location,
      addressText,
      addressObj, 
      fromManageAddress: fromManageAddress 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: normalize(40) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: normalize(10), bottom: normalize(10), left: normalize(10), right: normalize(10) }}
        >
          <Ionicons name="arrow-back" size={normalize(24)} color="black" />
        </TouchableOpacity>
        
        {/* தமிழுக்கு ஏற்றவாறு Font Size டைனமிக் ஆக மாறும் */}
        <Text style={[styles.headerTitle, { fontSize: isTamil ? normalize(15) : normalize(18) }]}>
          {t("select_location")}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0DB481" />
        ) : location ? (
          <MapView style={styles.map} initialRegion={location}>
            <Marker coordinate={location} title={t("current_location")} />
          </MapView>
        ) : (
          <Text style={{ fontSize: normalize(14) }}>{t("map_unavailable")}</Text>
        )}
      </View>

      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <Ionicons name="location-outline" size={normalize(20)} color="black" />
          <Text style={[styles.cityText, { fontSize: isTamil ? normalize(16) : normalize(18) }]}>
            {t("current_location")}
          </Text>
        </View>
        <Text 
          style={[styles.fullAddressText, { fontSize: isTamil ? normalize(12) : normalize(14) }]}
        >
          {addressText}
        </Text>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
          disabled={loading || !location}
          activeOpacity={0.8}
        >
          <Text 
            style={[styles.confirmButtonText, { fontSize: isTamil ? normalize(14) : normalize(16) }]}
          >
            {t("confirm_location")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingTop: normalize(20),
    paddingBottom: normalize(16),
    backgroundColor: "#FFF",
  },
  backButton: { 
    marginRight: normalize(16), 
    padding: normalize(5) 
  },
  headerTitle: { 
    fontWeight: "bold", 
    color: "#000" 
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  map: { 
    width: "100%", 
    height: "100%" 
  },
  addressCard: {
    padding: normalize(24),
    backgroundColor: "#FFF",
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: normalize(-2) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(5),
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  cityText: { 
    fontWeight: "bold", 
    marginLeft: normalize(8), 
    color: "#000" 
  },
  fullAddressText: {
    color: "#666",
    marginBottom: normalize(24),
    lineHeight: normalize(20),
  },
  confirmButton: {
    backgroundColor: "#0DB481",
    paddingVertical: normalize(16),
    borderRadius: normalize(12),
    alignItems: "center",
  },
  confirmButtonText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
});