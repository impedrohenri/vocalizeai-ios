import "dotenv/config";

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.cauta.vocalizeai.dev';
  if (IS_PREVIEW) return 'com.cauta.vocalizeai.preview';
  return 'com.cauta.vocalizeai';
};

const getAppName = () => {
  if (IS_DEV) return 'VocalizeAI (Dev)';
  if (IS_PREVIEW) return 'VocalizeAI (Preview)';
  return 'VocalizeAI';
};

const getSlug = () => {
  if (IS_DEV) return "vocalizeai-dev";
  if (IS_PREVIEW) return "vocalizeai-preview";
  return "vocalizeai-ios";
};

export default ({ config }) => ({
  ...config,
  expo: {
    name: getAppName(),
    slug: getSlug(),
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/splashscreen_logo.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    newArchEnabled: true,
    devClient: IS_DEV,

    ios: {
      bundleIdentifier: getUniqueIdentifier(),
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: IS_DEV || IS_PREVIEW,
        }
        ,
        UIBackgroundModes: [
          "audio",
          "fetch",
          "processing",
          "remote-notification"
        ],
        NSMicrophoneUsageDescription: "Precisa de acesso ao microfone para gravação de áudio",
        kTCCServiceMediaLibrary: "O aplicativo precisa de acesso à biblioteca de mídia para gravação de áudio",
        NSUserNotificationUsageDescription: "Precisamos enviar notificações para manter você informado sobre o status da gravação.",

      },
    },

    android: {
      package: getUniqueIdentifier(),
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
        "NOTIFICATIONS",
        "POST_NOTIFICATIONS",
      ],
      usesCleartextTraffic: IS_DEV || IS_PREVIEW,
      foregroundService: {
        name: "Gravação de Áudio",
        icon: "./assets/images/splashscreen_logo.png",
        notificationTitle: "Gravação em andamento",
        notificationColor: "#FF0000"
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
            usesCleartextTraffic: IS_DEV || IS_PREVIEW,
          },
        },
      ],
      [
        "expo-av",
        {
          microphonePermission: "Permitir que o VocalizeAI acesse o microfone para gravar áudio.",
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
      router: {
        origin: false
      },
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      },
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    },
  },
});