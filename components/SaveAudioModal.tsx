import { MaterialIcons } from '@expo/vector-icons'
import { Modal, View, ActivityIndicator, Text } from 'react-native'
import Toast from 'react-native-toast-message'
import ButtonCustom from './Button'
import { StyleSheet } from 'react-native'
import VocalizationSelect from './VocalizationSelect'
import { Vocalizacao } from '@/types/Vocalizacao'
import ParticipanteSelector from '@/components/ParticipanteSelect'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  AudioRecorder
} from 'expo-audio';
import { getVocalizacoes } from '@/services/vocalizacoesService'
import { getParticipantesByUsuario } from '@/services/participanteService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { File } from "expo-file-system";
import FileOperations from '@/utils/FileOperations'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


interface ISaveAudioModalProps {
  recording: AudioRecorder | null;
  showSaveAudioModal: boolean;
  setShowSaveAudioModal: Dispatch<SetStateAction<boolean>>;
  recordingTime: number;
}

export default function SaveAudioModal({
  recording,
  showSaveAudioModal, setShowSaveAudioModal,
  recordingTime }: ISaveAudioModalProps) {

  const [selectedParticipanteId, setSelectedParticipanteId] = useState<number>(0);
  const [selectedVocalizationId, setSelectedVocalizationId] = useState<number>(0);

  const [vocalizations, setVocalizations] = useState<Vocalizacao[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [loadingVocalizations, setLoadingVocalizations] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchParticipantes();
    fetchVocalizations();
  }, [showSaveAudioModal]);

  const fetchParticipantes = async () => {
    setLoadingParticipantes(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const data = await getParticipantesByUsuario(userId);
        setParticipantes(data);

        if (data.length > 0) {
          setSelectedParticipanteId(data[0].id);
        }
      }
    } catch (error: any) {
      if (showSaveAudioModal === true) {
        Toast.show({
          type: "error",
          text1: error instanceof Error ? JSON.stringify(error.message) : "Erro",
          text2: "Erro ao carregar participantes do usuário",
        });
      }
    } finally {
      setLoadingParticipantes(false);
    }
  };

  async function fetchVocalizations(forceRefresh: boolean = false) {
    setLoadingVocalizations(true);
    try {
      const vocalizations = await getVocalizacoes(forceRefresh);
      setVocalizations(vocalizations);

      if (!selectedVocalizationId && vocalizations.length > 0) {
        setSelectedVocalizationId(vocalizations[0].id);
      }
    } catch (error) {
      if (showSaveAudioModal === true) {
        Toast.show({
          type: "error",
          text1: error instanceof Error ? JSON.stringify(error.message) : "Erro",
          text2: "Não foi possível carregar os rótulos de vocalizações",
        });
      }
    } finally {
      setLoadingVocalizations(false);
    }
  }


  const handleSaveAudio = async () => {
    if (!selectedVocalizationId) {
      Toast.show({
        type: "error",
        text1: "Rótulo não selecionado",
        text2: "Por favor, selecione um rótulo de vocalização.",
      });
      return;
    }
    if (!selectedParticipanteId) {
      Toast.show({
        type: "error",
        text1: "Participante não selecionado",
        text2: "Por favor, selecione um participante.",
      });
      return;
    }
    if (!recording) {
      Toast.show({
        type: "error",
        text1: "Nenhuma gravação",
        text2: "Não foi encontrada gravação para salvar.",
      });
      return;
    }

    try {
      await recording.stop();
      let uri = recording.uri;

      if (!uri) {
        throw new Error("URI da gravação não encontrada.");
      }

      if (!uri.startsWith("file://")) {
        uri = `file://${uri}`;
      }

      // Verificação física do arquivo
      const tempFile = new File(uri);
      const fileInfo = tempFile.info();

      if (!fileInfo.exists) {
        throw new Error("Arquivo de áudio não existe.");
      }

      if (!fileInfo.size || fileInfo.size < 50) {
        throw new Error("Arquivo de áudio inválido ou muito pequeno.");
      }

      const audioDir = await FileOperations.getAudioDirectory();
      const fileName = `recording_${Date.now()}.m4a`;
      const newUri = `${audioDir}${fileName}`;
      const finalFile = new File(newUri)
      console.log(">>>>>>", newUri)

      try {
        tempFile.move(finalFile);
      } catch (e) {
        throw new Error("Erro ao mover arquivo de áudio.");
      }

      const vocalizationName =
        vocalizations.find(v => v.id === selectedVocalizationId)?.nome ??
        "Desconhecido";

      const existingRecordings = await AsyncStorage.getItem("recordings");
      const recordings = existingRecordings
        ? JSON.parse(existingRecordings)
        : [];

      recordings.push({
        uri: newUri,
        timestamp: Date.now(),
        duration: recordingTime,
        vocalizationId: selectedVocalizationId,
        vocalizationName,
        participanteId: selectedParticipanteId,
        status: "pending",
      });

      await AsyncStorage.setItem("recordings", JSON.stringify(recordings));

      // Reset de estados
      setShowSaveAudioModal(false);

      Toast.show({
        type: "success",
        text1: "Gravação salva",
        text2: "A gravação foi salva com sucesso.",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao salvar gravação",
        text2: error?.message || "Erro desconhecido",
      });
    }
  };



  return (
    <>
      <Modal
        visible={showSaveAudioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveAudioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: 24 + insets.bottom }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Rótulo</Text>
              <MaterialIcons
                name="close"
                size={24}
                color="#666"
                onPress={() => setShowSaveAudioModal(false)}
                style={styles.modalClose}
              />
            </View>
            {loadingParticipantes ? (
              <ActivityIndicator size="large" color="#2196F3" />
            ) : (
              <ParticipanteSelector
                participantes={participantes}
                selectedParticipanteId={selectedParticipanteId}
                onParticipanteChange={setSelectedParticipanteId}
              />
            )}
            {loadingVocalizations ? (
              <ActivityIndicator size="large" color="#2196F3" />
            ) : (
              <VocalizationSelect
                vocalizations={vocalizations}
                selectedVocalizationId={selectedVocalizationId}
                onValueChange={(value) => setSelectedVocalizationId(value)}
              />
            )}

            <View style={styles.modalActions}>
              <ButtonCustom
                title="Salvar Gravação"
                onPress={handleSaveAudio}
                color="#2196F3"
                style={styles.modalButton}
                icon={<MaterialIcons name="save" size={20} color="#FFF" />}
              />
            </View>
          </View>
        </View>
        <Toast />
      </Modal>

    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
  },
  modalClose: {
    padding: 4,
  },
  modalActions: {
    marginTop: 24,
  },
  modalButton: {
    marginVertical: 8,
  },
});