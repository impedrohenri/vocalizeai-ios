import ConfirmationModal from "@/components/ConfirmationModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Timer from "@/components/Timer";
import SaveAudioModal from "@/components/SaveAudioModal";
import { RecordingContext } from "@/contexts/RecordingContext";

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [showSaveAudioModal, setShowSaveAudioModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const {setIsRecording: setContextIsRecording} = useContext(RecordingContext);

  useEffect(() => {
    try {
      Audio
        .requestPermissionsAsync()
        .then((granted) => {
          if (granted.granted) {
            Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              interruptionModeIOS: InterruptionModeIOS.DuckOthers,
              shouldDuckAndroid: true,
              interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
              playThroughEarpieceAndroid: false,
              staysActiveInBackground: true,
            });
            setHasPermission(granted.granted);
          }
        })
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erro ao configurar áudio",
        text2: err instanceof Error ? JSON.stringify(err.message) : "Não foi possível obter a permissão para gravação.",
      });
    }


  }, []);

  useEffect(() => {
    if (!recording) return;
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording) {
        setRecordingTime(Math.floor(status.durationMillis / 1000));
      }
    });
    recording.setProgressUpdateInterval(100);

    return () => {
      recording.setOnRecordingStatusUpdate(null);
    };
  }, [recording])

  const startRecording = async () => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true
    })

    try {
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setContextIsRecording(true)
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erro ao iniciar gravação",
        text2: err instanceof Error ? JSON.stringify(err.message) : "Por favor, tente novamente mais tarde.",
      });
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;

    let status = await recording.getStatusAsync();

    if (status.isRecording) {
      status = await recording.pauseAsync();
      setIsPaused(true)
      setIsRecording(status.isRecording);
      setContextIsRecording(status.isRecording)
    }
  };

  const unpauseRecording = async () => {
    if (!recording) return;

    let status = await recording.getStatusAsync();

    if (isPaused) {
      status = await recording.startAsync();
      setIsRecording(status.isRecording);
      setContextIsRecording(status.isRecording)
    }

    setIsPaused(false);
  }

  const saveRecordingLocally = async () => {
    setShowSaveAudioModal(true);
  };

  const handleRecordPress = async () => {
    setIsLoading(true);

    try {
      if (!!recording && !isPaused) {
        pauseRecording();
      } else if (!!recording && isPaused) {
        unpauseRecording();
      } else if (!recording) {
        startRecording();
      }
    } finally {
      setIsLoading(false);
    }

  }

  const handleDiscard = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const status = await recording.getStatusAsync();
      setIsRecording(status.isRecording);
      setContextIsRecording(status.isRecording)
      setIsPaused(false);
      setRecording(null);
      setRecordingTime(0);
    }
    setShowDiscardModal(false);
  };

  return (
    <View style={styles.container}>

      <Timer isRecording={isRecording} isPaused={isPaused} recordingTime={recordingTime} />

      <View style={styles.controlContainer}>
        {(isPaused || (recording && !isRecording)) && (
          <Pressable
            onPress={() => setShowDiscardModal(true)}
            style={({ pressed }) => [
              styles.controlButton,
              styles.discardButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons name="delete-outline" size={32} color="white" />
            <Text style={styles.buttonText}>Descartar</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            styles.recordButton,
            isRecording && styles.recordingButton,
            pressed && styles.buttonPressed]}
          onPress={handleRecordPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <MaterialIcons
                name={
                  isRecording && !isPaused
                    ? "pause"
                    : isPaused
                      ? "play-arrow"
                      : "mic"
                }
                size={40}
                color="white"
              />
              <Text
                style={[
                  styles.buttonText
                ]}
              >
                {isRecording && !isPaused
                  ? "Pausar"
                  : isPaused
                    ? "Continuar"
                    : "Gravar"}
              </Text>
            </>
          )}
        </Pressable>

        {(isPaused || (recording && !isRecording)) && (
          <Pressable
            onPress={saveRecordingLocally}
            style={({ pressed }) => [
              styles.controlButton,
              styles.saveButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons name="save" size={32} color="white" />
            <Text style={styles.buttonText}>Salvar</Text>
          </Pressable>
        )}
      </View>

      <SaveAudioModal
        recording={recording}
        setRecording={setRecording}
        showSaveAudioModal={showSaveAudioModal}
        setShowSaveAudioModal={setShowSaveAudioModal}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        recordingTime={recordingTime}
        setRecordingTime={setRecordingTime}
      />

      <ConfirmationModal
        visible={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={handleDiscard}
        message="Tem certeza que deseja descartar a gravação?"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  timerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    color: "#2196F3",
    fontVariant: ["tabular-nums"],
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F44336",
    marginRight: 8,
  },
  recordingText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
  },
  cooldownText: {
    opacity: 0.7,
    color: "#999",
  },
  controlContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
    gap: 20,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    minWidth: 96,
  },
  recordButton: {
    backgroundColor: "#2196F3",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  recordingButton: {
    backgroundColor: "#F44336",
  },
  discardButton: {
    backgroundColor: "#757575",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
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
  warningContainer: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#FFE0B2",
    elevation: 2,
  },
  warningText: {
    fontSize: 14,
    color: "#E65100",
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  warningButtonText: {
    color: "#FFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
