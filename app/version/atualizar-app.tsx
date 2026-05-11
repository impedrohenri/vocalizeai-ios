import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View, Linking, Pressable } from "react-native";

export default function AtualizarApp() {

  const handleUpdatePress = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/br/app/vocalizeai/id6760232544");
    } else if (Platform.OS === "android") {
      Linking.openURL("https://play.google.com/store/apps/details?id=com.cauta.vocalizeai");
    }
  };

  return (
    <View style={styles.section}>

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>VocalizeAI</Text>

        <LinearGradient
          colors={["#2196F3", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underline}
        />
      </View>

      <Modal transparent={true} animationType="fade" visible={true} >
        <Pressable style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atualização Necessária</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Uma nova versão do aplicativo está disponível. Por favor, atualize para continuar usando o VocalizeAI.
              </Text>

              <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
                <Text style={styles.updateButtonText}>Atualizar Agora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    display: "flex",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
  },
  modalBody: {
    alignItems: "center",
    gap: 24,
    width: "95%",
  },
  modalText: {
    fontSize: 16,
    color: "#424242",
    textAlign: "center",
    
  },
  updateButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoContainer: {
    alignItems: "center",
    width: "100%",
  },
  logoText: {
    fontSize: 42,
    fontFamily: "Quicksand-Bold",
    letterSpacing: 1.2,
    color: "#2196F3",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 100,
  },
  underline: {
    width: "50%",
    height: 3,
    marginTop: 8,
    borderRadius: 2,
  },
});