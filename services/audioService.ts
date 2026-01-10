import { api } from "./api";
import { AudioItem } from "@/types/Audio";
import notificationService from "./notificationService";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Faz upload de um arquivo de áudio
 * @param filePath Caminho do arquivo de áudio
 * @param originalFileName Nome original do arquivo
 * @param participanteId ID do participante
 * @param vocalizacaoId ID da vocalização
 * @returns Promise com a resposta da API
 */
export const uploadAudioFile = async (
  filePath: string,
  participanteId: number,
  originalFileName: string,
  vocalizacaoId: number
): Promise<AudioItem> => {
  try {
    const formData = new FormData();
    
    formData.append("file", {
      uri: filePath,
      name: originalFileName,
      type: "audio/wav",
    } as any);
    
    formData.append("participante_id", participanteId.toString());
    formData.append("vocalizacao_id", vocalizacaoId.toString());

    const response = await api.post("/audios", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao fazer upload do áudio.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém a lista de áudios
 * @returns Promise com lista de áudios
 */
export const getAudios = async (): Promise<AudioItem[]> => {
  try {
    const response = await api.get("/audios");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar áudios.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém um áudio específico
 * @param audioId ID do áudio
 * @returns Promise com dados do áudio
 */
export const getAudio = async (audioId: number): Promise<AudioItem> => {
  try {
    const response = await api.get(`/audios/${audioId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar áudio.";
    throw new Error(errorMessage);
  }
};

/**
 * Deleta um áudio
 * @param audioId ID do áudio a ser deletado
 * @returns Promise
 */
export const deleteAudio = async (audioId: number): Promise<void> => {
  try {
    await api.delete(`/audios/${audioId}`);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao deletar áudio.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém áudios por participante
 * @param participanteId ID do participante
 * @returns Promise com lista de áudios do participante
 */
export const getAudiosByParticipante = async (participanteId: number): Promise<AudioItem[]> => {
  try {
    const response = await api.get(`/audios/participante/${participanteId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar áudios do participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém áudios por vocalização
 * @param vocalizacaoId ID da vocalização
 * @returns Promise com lista de áudios da vocalização
 */
export const getAudiosByVocalizacao = async (vocalizacaoId: string): Promise<AudioItem[]> => {
  try {
    const response = await api.get(`/audios/vocalizacao/${vocalizacaoId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar áudios da vocalização.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém a quantidade de áudios por participante
 * @param participanteId ID do participante
 * @returns Promise com número de áudios do participante
 */
export const amountAudiosByParticipante = async (participanteId: number): Promise<number> => {
  try {
    const audios = await getAudiosByParticipante(participanteId);
    return audios.length;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar quantidade de áudios do participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém URL para reprodução de áudio
 * @param audioId ID do áudio
 * @returns Promise com URL do áudio
 */
export const getAudioPlayUrl = async (audioId: number): Promise<string> => {
  try {
    const response = await api.get(`/audios/${audioId}/play`);
    return response.data.url || response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao obter URL do áudio.";
    throw new Error(errorMessage);
  }
};

/**
 * Lista áudios por participante (alias para compatibilidade)
 * @param participanteId ID do participante
 * @returns Promise com lista de áudios do participante
 */
export const listAudiosByParticipante = async (participanteId: number): Promise<AudioItem[]> => {
  return getAudiosByParticipante(participanteId);
};

/**
 * Atualiza dados de um áudio
 * @param audioId ID do áudio
 * @param updateData Dados para atualizar
 * @returns Promise com dados atualizados do áudio
 */
export const updateAudio = async (audioId: number, updateData: Partial<AudioItem>): Promise<AudioItem> => {
  try {
    const response = await api.patch(`/audios/${audioId}`, updateData);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao atualizar áudio.";
    throw new Error(errorMessage);
  }
};

/**
 * Salva áudio localmente com status pending
 * @param audioData Dados do áudio
 * @returns Promise
 */
export const saveAudioLocally = async (audioData: {
  uri: string;
  duration: number;
  participanteId: number;
  vocalizationId: number;
  vocalizationName: string;
}): Promise<void> => {
  try {
    const existingAudios = await getLocalAudios();
    const newAudio = {
      ...audioData,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    const updatedAudios = [...existingAudios, newAudio];
    await AsyncStorage.setItem('@vocalizeai_audios', JSON.stringify(updatedAudios));
    
    await notificationService.updateNotifications();
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém áudios salvos localmente
 * @returns Promise com lista de áudios locais
 */
export const getLocalAudios = async (): Promise<any[]> => {
  try {
    const audiosData = await AsyncStorage.getItem('@vocalizeai_audios');
    return audiosData ? JSON.parse(audiosData) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Remove áudio da lista local
 * @param timestamp Timestamp do áudio para remover
 * @returns Promise
 */
export const removeLocalAudio = async (timestamp: number): Promise<void> => {
  try {
    const existingAudios = await getLocalAudios();
    const filteredAudios = existingAudios.filter(audio => audio.timestamp !== timestamp);
    await AsyncStorage.setItem('@vocalizeai_audios', JSON.stringify(filteredAudios));
    
    await notificationService.updateNotifications();
  } catch (error) {
    throw error;
  }
};

/**
 * Marca áudio como enviado (remove status pending)
 * @param timestamp Timestamp do áudio
 * @returns Promise
 */
export const markAudioAsSent = async (timestamp: number): Promise<void> => {
  try {
    const existingAudios = await getLocalAudios();
    const updatedAudios = existingAudios.map(audio => 
      audio.timestamp === timestamp 
        ? { ...audio, status: 'sent' }
        : audio
    );
    await AsyncStorage.setItem('@vocalizeai_audios', JSON.stringify(updatedAudios));
    
    await notificationService.updateNotifications();
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém apenas áudios pendentes
 * @returns Promise com lista de áudios pendentes
 */
export const getPendingAudios = async (): Promise<any[]> => {
  try {
    const allAudios = await getLocalAudios();
    return allAudios.filter(audio => audio.status === 'pending');
  } catch (error) {
    return [];
  }
};

/**
 * Limpa todos os áudios locais
 * @returns Promise
 */
export const clearLocalAudios = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@vocalizeai_audios');
    await notificationService.updateNotifications();
  } catch (error) {
    throw error;
  }
};
