import { router } from "expo-router";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import ButtonCustom from "@/components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { api } from "@/services/api";
import Toast from "react-native-toast-message";

export default function AdminLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateInviteCode = async () => {
    setIsGenerating(true)
    setIsModalOpen(true)

    try {
      const response = await api.post("/usuarios/gerar-codigo-convite");
      setInviteCode(response.data.codigo_convite);
    } catch (error : any) {
      Toast.show({
        type: "error",
        text1: "Erro ao gerar código de convite",
        text2: error.response?.data?.message || "Tente novamente.",
      });
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <View style={styles.container}>
      <ButtonCustom
        title="Gerenciar Usuários"
        onPress={() => router.push("/admin/usuarios")}
        style={styles.btnSize}
      />
      <ButtonCustom
        title="Gerenciar Participantes"
        onPress={() => router.push("/admin/participantes")}
        style={styles.btnSize}
      />
      <ButtonCustom
        title="Gerar Código de Convite"
        onPress={() => {handleGenerateInviteCode()}}
        style={styles.btnGenerateInviteCode}
        variant="secondary"
        icon={<MaterialIcons name="confirmation-number" size={25} color={"#2196F3"}/>}
      />


      <Modal
        visible={isModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.5)"}]}
            onPress={() => setIsModalOpen(false)}
          />

          <View style={styles.modalContent}>
            <Text style={styles.title}>Código Gerado</Text>
            <View style={{flexDirection: "row", alignItems: "center", marginBottom: 50, marginTop: 20}}>
              <MaterialIcons name="copy-all" size={24}/>
              <Text selectable={true} style={styles.inviteCode}>{ isGenerating ?
                  <ActivityIndicator
                    size="small"
                    color="#2196F3"
                  />  : inviteCode}</Text>
            </View>
            <ButtonCustom
              title="Fechar"
              onPress={() => setIsModalOpen(false)}
              style={styles.btnSize}
            />
          </View>
          
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnSize: {
    width: 300,
    marginBottom: 10,
  },
  btnGenerateInviteCode:{
    width: 300,
    marginTop: 40,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    margin: "auto",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#555555",
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2196F3",
  },
});
