import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import ButtonCustom from "./Button";
import Input from "./Inputs/Input";  
import { deleteUser, getUser, sendAccountDeletionCode, verifyAccountDeletionCode } from "@/services/usuarioService";
import Toast from "react-native-toast-message";
import { getUserId } from "@/services/util";
import { doLogout } from "@/services/authService";

interface DeleteAccountModalProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isLoading?: boolean;
}

export default function DeleteAccountModal({
  isVisible,
  setIsVisible,
  isLoading = false,
}: DeleteAccountModalProps) {
  const [wantToDelete, setWantToDelete] = useState(false);
  const [validConfirmationCode, setValidConfirmationCode] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible) {
      setWantToDelete(false);
      setError("");
    }
  }, [isVisible]);

  const sendConfirmationCode = async () => {
    const resp = await sendAccountDeletionCode()

    if (resp.status === 200) {
      Toast.show({
        type: "success",
        text1: "Código enviado",
        text2: "Um código de confirmação foi enviado para seu e-mail.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Erro" + String(resp.status),
        text2: "Não foi possível enviar o código. Por favor, tente novamente mais tarde.",
      });
    }
  }

  const handleContinue = async () => {
    setWantToDelete(true);
    await sendConfirmationCode();
  }

  const handleIdentityValidation = async () => {
    const resp = await verifyAccountDeletionCode(confirmationCode)
    if (resp.valid) {
      setValidConfirmationCode(true)
    } else if (!resp.valid) {
      Toast.show({
        type: "error",
        text1: "Código inválido",
        text2: "O código de confirmação digitado é inválido. Por favor, verifique seu e-mail e tente novamente.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível verificar o código. Por favor, tente novamente mais tarde.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (wantToDelete && validConfirmationCode) {
      const userId = await getUserId();
      await deleteUser(userId);
      await doLogout();
      Toast.show({
        type: "success",
        text1: "Conta excluída",
        text2: "Sua conta foi excluída com sucesso!",
      });
      setIsVisible(false);
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    setWantToDelete(false);
    setConfirmationCode("")
    setValidConfirmationCode(false)
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>

            {!wantToDelete && (
              /* ETAPA 1: AVISO INICIAL */
              <>
                <Text style={styles.title}>Deseja excluir sua conta?</Text>
                <Text style={styles.modalText}>
                  Esta ação é <Text style={{ fontWeight: "bold", color: "#F44336" }}>irreversível</Text>.
                  Ao excluir sua conta, todos os seus dados e áudios gravados serão apagados permanentemente.
                </Text>

                <View style={styles.modalButtons}>
                  <ButtonCustom
                    title="Cancelar"
                    onPress={handleCancel}
                    color="#757575"
                    style={{ width: "48%" }}
                  />
                  <ButtonCustom
                    title="Sim, continuar"
                    onPress={handleContinue}
                    color="#F44336"
                    style={{ width: "48%" }}
                  />
                </View>
              </>
            )}

            {(wantToDelete && !validConfirmationCode) && (
              /* ETAPA 2: CONFIRMAÇÃO POR CÓDIGO DE E-MAIL */
              <>
                <Text style={styles.title}>Confirme sua Identidade</Text>
                <Text style={styles.modalText}>
                  Para confirmar sua identidade, por favor, digite o código de confirmação enviado para seu e-mail.
                </Text>

                <Input
                  placeholder="Código de confirmação"
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                  error={!!error}
                  errorMessage={error}
                  style={{ width: "100%", marginBottom: 34 }}
                />

                <View style={styles.modalButtons}>

                  <ButtonCustom
                    title="Cancelar"
                    onPress={handleCancel}
                    color="#757575"
                    style={{ width: "48%" }}
                  />
                  <ButtonCustom
                    title="Confirmar código"
                    onPress={handleIdentityValidation}
                    color="#F44336"
                    style={{ width: "48%" }}
                  />
                </View>
                
                <ButtonCustom
                  title="Reenviar código"
                  onPress={sendConfirmationCode}
                  variant="link"
                  style={{ marginTop: 10, width: "100%" }}
                  disabled={isLoading}
                />
              </>
            )}

            {wantToDelete && validConfirmationCode && (
              /* ETAPA 3: EXCLUSÃO */
              <>
                <Text style={styles.title}>Excluir conta</Text>
                <Text style={styles.modalText}>
                  Ao clicar em "Excluir minha conta", você compreende que sua conta será permanentemente apagada, e que seus dados não poderão mais ser recuperados.
                </Text>

                <View style={{width: "100%", flexDirection: "column", alignItems: "center", gap: 14}}>
                  <ButtonCustom
                    title="Cancelar"
                    onPress={handleCancel}
                    color="#757575"
                    style={{ width: "90%" }}
                  />
                  <ButtonCustom
                    title="Excluir minha conta"
                    onPress={handleDeleteAccount}
                    color="#F44336"
                    style={{ width: "90%" }}
                  />
                </View>
              </>
            )}

            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#F44336"
                style={styles.loader}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo um pouco mais escuro para destaque
  },
  modalContent: {
    width: "85%",
    padding: 24,
    backgroundColor: "white",
    borderRadius: 20, // Bordas mais arredondadas como no 2º estilo
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#212121",
  },
  modalText: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: "center",
    color: "#616161",
    lineHeight: 22,
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loader: {
    marginTop: 20,
  },
});