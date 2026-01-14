import { isAuthenticated } from "@/services/authService";
import { getParticipantesByUsuario } from "@/services/participanteService";
import { getUser } from "@/services/usuarioService";
import { checkAndClearOldCache } from "@/services/util";
import { getVocalizacoes } from "@/services/vocalizacoesService";
import notificationService from "@/services/notificationService";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Font from "expo-font";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const fontMap = {
  Quicksand: require("@/assets/fonts/Quicksand-Regular.ttf"),
  "Quicksand-Bold": require("@/assets/fonts/Quicksand-Bold.ttf"),
};

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  const loadFonts = async () => {
    try {
      await Font.loadAsync(fontMap);
      setFontsLoaded(true);
      return true;
    } catch (error) {
      setFontsLoaded(true);
      return false;
    }
  };

  const loadInitialData = async () => {
    try {
      const userData = await getUser();
      const userId = userData.id;
      if (userId) {
        await getParticipantesByUsuario(userId);
      }
      await getVocalizacoes();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Por favor, tente novamente mais tarde.",
      });
    }
  };

  const checkToken = async () => {
    try {
      await loadFonts();
      try {
        await checkAndClearOldCache();
      } catch {}

      notificationService.initialize().catch(() => {});

      let authenticated = false;
      try {
        authenticated = await isAuthenticated();
      } catch {
        authenticated = false;
      }

      if (authenticated) {
        router.replace("/(tabs)");
        loadInitialData();
      } else {
        router.replace("/auth/login");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Redirecionando para login",
      });
      router.replace("/auth/login");
    } finally {
      setTimeout(() => {
        setIsSplashVisible(false);
        SplashScreen.hideAsync();
      }, 1500);
    }
  };

  useEffect(() => {
    checkToken();
    const failSafe = setTimeout(() => {
      if (isSplashVisible) {
        setIsSplashVisible(false);
        SplashScreen.hideAsync().catch(() => void 0);
      }
    }, 5000);
    return () => clearTimeout(failSafe);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isSplashVisible ? (
        <View style={styles.splashContainer}>
          <MaskedView
            style={styles.maskedView}
            maskElement={
              <Text
                style={[
                  styles.splashText,
                  fontsLoaded ? { fontFamily: "Quicksand-Bold" } : null,
                ]}
              >
                VocalizeAI
              </Text>
            }
          >
            <LinearGradient
              colors={["#2196F3", "#03A9F4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
              <Text
                style={[
                  styles.splashText,
                  { opacity: 0 },
                  fontsLoaded ? { fontFamily: "Quicksand-Bold" } : null,
                ]}
              >
                VocalizeAI
              </Text>
            </LinearGradient>
          </MaskedView>

          <LinearGradient
            colors={["#2196F3", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.underline}
          />

          <ActivityIndicator
            style={{ marginTop: 30 }}
            size="large"
            color="#2196F3"
          />
        </View>
      ) : null}
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }} edges={["top"]}>
        <Slot />
      </SafeAreaView>
      <Toast visibilityTime={3000} position="top" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    zIndex: 1,
  },
  maskedView: {
    height: 60,
    flexDirection: "row",
  },
  splashText: {
    fontSize: 48,
    fontFamily: "Quicksand-Bold",
    letterSpacing: 1.2,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  underline: {
    width: "60%",
    height: 3,
    marginTop: 8,
    borderRadius: 2,
  },
});