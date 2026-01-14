import "dotenv/config";

export default {
  expo: {
    name: "VocalizeAI - Teste",
    slug: "vocalizeai-teste",
    version: "0.0.3",
    orientation: "portrait",
    icon: "./assets/images/splashscreen_logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    newArchEnabled: true,
    devClient: true,

    ios: {
      bundleIdentifier: "com.teste.vocalizeai",
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "Precisamos de acesso ao microfone para gravar as vocalizações. (tag 0.0.3)",
      },
    },

    android: {
      package: "com.teste.vocalizeai",
      adaptiveIcon: {
        foregroundImage: "./assets/images/splashscreen_logo.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "RECORD_AUDIO",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MICROPHONE",
        "WAKE_LOCK",
        "MODIFY_AUDIO_SETTINGS",
        "POST_NOTIFICATIONS",
      ],
      foregroundService: {
        name: "Gravação de Áudio",
        icon: "./assets/images/splashscreen_logo.png",
        notificationTitle: "Gravação em andamento",
        notificationColor: "#FF0000",
      },
    },

    plugins: [
      "expo-router",
      "expo-audio",
      "expo-font",
      "expo-web-browser",
      "expo-asset",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splashscreen_logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],

      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 26,
          },
        },
      ],

      [
        "expo-av",
        {
          microphonePermission:
            "Permitir que o VocalizeAI acesse o microfone para gravar áudio.",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    assetBundlePatterns: [
      "assets/images/*.png",
      "assets/fonts/*.ttf",
    ],

    extra: {
      eas: {
        projectId: "5ac1e2c8-37ca-4f85-abd1-ff85fd3eb4db",
      },
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    },
  },
};
