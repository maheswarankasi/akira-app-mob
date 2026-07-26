import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import Swiper from "react-native-swiper";
import { useSelector } from "react-redux";

// முந்தைய செஷனில் உருவாக்கிய normalize ஃபங்ஷனை இம்போர்ட் செய்கிறோம்
import { normalize } from "../utils/responsive";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }) {
  const swiperRef = useRef(null);
  const { t } = useTranslation();

  const currentLang = useSelector((state) => state.language.language);
  const isTamil = currentLang === "ta";

  // Swiper-la next poga illa next screen (Login) poga
  const handleNext = (index) => {
    if (index === 0) {
      // 1st slide-la iruntha, 2nd slide-ku move pannu
      swiperRef.current.scrollBy(1);
    } else {
      // 2nd slide-la iruntha, Login screen-ku navigate pannu
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={true}
        dot={<View style={styles.inactiveDot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.paginationStyle}
      >
        {/* ===================== SLIDE 1 (Page 4) ===================== */}
        <ImageBackground
          source={require("../assets/images/Page-4.webp")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.slide}>
            <View style={styles.textContainer1}>
              <Text style={styles.title}>{t("mentor_name")}</Text>
              <Text style={styles.subtitle}>{t("mentor_location")}</Text>

              <Text style={styles.highlightText}>{t("inspired_title")}</Text>
              <Text style={styles.description}>{t("inspired_desc1")}</Text>
              <Text style={styles.desc2}>{t("inspired_desc2")}</Text>
            </View>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => handleNext(0)}
              >
                <Text style={styles.nextButtonText}>{t("next")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* ===================== SLIDE 2 (Page 5) ===================== */}
        <ImageBackground
          source={require("../assets/images/Page-5.webp")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.slide}>
            <View
              style={[
                styles.textContainer2,
                { paddingBottom: isTamil ? "38%" : "53%" }, // Percentage-ஐ அப்படியே வைக்கலாம், Responsive-க்கு நல்லது
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: "#2E7D32",
                    // மொழிக்கு தகுந்தாற்போல் அளவுகளை Normalize செய்கிறோம்
                    fontSize: isTamil ? normalize(24) : normalize(36),
                    lineHeight: isTamil ? normalize(35) : normalize(42),
                  },
                ]}
              >
                {t("eat_pure")}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    paddingHorizontal: normalize(40),
                    fontSize: isTamil ? normalize(11) : normalize(18),
                    textAlign: "center",
                    lineHeight: isTamil ? normalize(18) : normalize(30),
                  },
                ]}
              >
                {t("bridge_gap")}
              </Text>

              <View style={isTamil ? styles.greenBoxTamil : styles.greenBox}>
                <Text
                  style={
                    isTamil ? styles.greenBoxTitleTamil : styles.greenBoxTitle
                  }
                >
                  {t("back_to_roots")}
                </Text>
                <Text
                  style={
                    isTamil ? styles.greenBoxDescTamil : styles.greenBoxDesc
                  }
                >
                  {t("roots_desc")}
                </Text>
              </View>
            </View>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => handleNext(1)}
              >
                <Text style={styles.nextButtonText}>{t("next")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </Swiper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer1: {
    flex: 1,
    paddingHorizontal: normalize(24),
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: normalize(40),
  },
  textContainer2: {
    flex: 1,
    paddingHorizontal: normalize(5),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: normalize(22),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: normalize(8),
  },
  subtitle: {
    fontSize: normalize(14),
    color: "#555",
    textAlign: "center",
    marginBottom: normalize(20),
  },
  highlightText: {
    fontSize: normalize(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: normalize(8),
    textAlign: "center",
  },
  description: {
    fontSize: normalize(13),
    color: "#666",
    textAlign: "center",
    lineHeight: normalize(20),
  },
  desc2: {
    paddingTop: normalize(8),
    fontSize: normalize(13),
    color: "#666",
    textAlign: "center",
    lineHeight: normalize(20),
  },
  greenBox: {
    padding: normalize(25),
    borderRadius: normalize(16),
    width: "100%",
    marginTop: normalize(10),
    paddingHorizontal: normalize(50) 
  },
  greenBoxTamil: {
    padding: normalize(40),
    borderRadius: normalize(16),
    width: "100%",
    marginTop: 0,
  },
  greenBoxTitle: {
    color: "#FFF",
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: normalize(8),
    lineHeight: normalize(24),
  },
  greenBoxTitleTamil: {
    color: "#FFF",
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: normalize(10),
    lineHeight: normalize(20),
  },
  greenBoxDesc: {
    color: "#FFF",
    fontSize: normalize(16),
    textAlign: "center",
    lineHeight: normalize(24),
  },
  greenBoxDescTamil: {
    color: "#FFF",
    fontSize: normalize(12),
    textAlign: "center",
    lineHeight: normalize(16),
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(40),
    width: "100%",
  },
  nextButton: {
    backgroundColor: "#FF2A5F",
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(32),
    borderRadius: normalize(25),
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: normalize(16),
    fontWeight: "bold",
  },
  inactiveDot: {
    backgroundColor: "#D3D3D3",
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    marginHorizontal: normalize(4),
  },
  activeDot: {
    backgroundColor: "#FF2A5F",
    width: normalize(24),
    height: normalize(8),
    borderRadius: normalize(4),
    marginHorizontal: normalize(4),
  },
  paginationStyle: {
    bottom: normalize(50), // Dots-ah Next button-ku nera alignment pandrathuku
    justifyContent: "flex-start",
    left: normalize(24),
  },
});
