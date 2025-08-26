import { api } from "./api";
import { AudioItem } from "@/types/Audio";

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
