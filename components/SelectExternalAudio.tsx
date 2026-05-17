import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import ButtonCustom from '@/components/Button';
import SaveAudioModal from './SaveAudioModal';
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function SelectExternalAudio() {

  const [audioUri, setAudioUri] = useState<string>("");
  const [showSaveAudioModal, setShowSaveAudioModal] = useState(false);

  const player = useAudioPlayer(audioUri);

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const audio = result.assets[0];
      setAudioUri(audio.uri);


      setShowSaveAudioModal(true);
    }
  };


  return (
    <>
      
      <View style={{ marginTop: 20 }}>
        <ButtonCustom
          title="Enviar áudio externo"
          onPress={pickAudio}
          variant="link"
          icon={<MaterialIcons name="upload-file" size={20} color="#2196F3" />}
          size="small"
        />
      </View>

      <SaveAudioModal
        externalAudio={player}
        externalAudioFile={{ uri: audioUri }}
        showSaveAudioModal={showSaveAudioModal}
        setShowSaveAudioModal={setShowSaveAudioModal}
        recordingTime={player.duration * 1000}
      />
    </>
  );
}