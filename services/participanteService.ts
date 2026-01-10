import { ParticipantePayload } from "@/types/ParticipantePayload";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import { api } from "./api";

const STORAGE_KEYS = {
  USER_PARTICIPANTES: "user_participantes_"
};

const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

/**
 * Cria um novo participante
 * @param data Objeto contendo os dados do participante
 * @returns Retorna os dados do participante criado
 * @throws Lança um erro caso a criação falhe
 */
export const createParticipante = async (data: ParticipantePayload): Promise<any> => {
  try {
    const response = await api.post(`/participantes`, data);
    
    await invalidateParticipantCache();
    await AsyncStorage.setItem("hasParticipant", "true");
    await AsyncStorage.setItem("participantId", response.data.id.toString());
    
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const storageKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${userId}`;
      const storedDataStr = await AsyncStorage.getItem(storageKey);
      
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        storedData.data.push(response.data);
        storedData.timestamp = Date.now();
        await AsyncStorage.setItem(storageKey, JSON.stringify(storedData));
      } else {
        const newData = {
          data: [response.data],
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify(newData));
      }
    }

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao criar participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém um participante específico
 * @param participantId ID do participante
 * @returns Retorna os dados do participante
 * @throws Lança um erro caso o ID não seja fornecido ou a requisição falhe
 */
export const getParticipante = async (participantId: string): Promise<any> => {
  try {
    if (!participantId) throw new Error("ID do participante não fornecido");
    
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (isConnected) {
      try {
        const response = await api.get(`/participantes/${participantId}`);
        return response.data;
      } catch (apiError) {
      }
    }
    
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const userParticipantsKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${userId}`;
      const userParticipantsStr = await AsyncStorage.getItem(userParticipantsKey);
      
      if (userParticipantsStr) {
        const userParticipantsData = JSON.parse(userParticipantsStr);
        const participants = userParticipantsData.data;
        
        if (participants && Array.isArray(participants)) {
          const participant = participants.find((p: any) => p.id.toString() === participantId);
          if (participant) {
            return participant;
          }
        }
      }
    }
    
    throw new Error("Participante não encontrado no armazenamento local");
  } catch (error: any) {
    
    if (error instanceof Error) {
      throw error;
    }
    
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém todos os participantes de um usuário específico e salva no AsyncStorage,
 * verifica se os dados estão armazenados localmente e se estão expirados.
 * Se não houver conexão com a internet, tenta usar os dados armazenados
 * @param usuarioId ID do usuário
 * @returns Retorna uma lista de todos os participantes do usuário
 * @throws Lança um erro caso ocorra alguma falha ao buscar os participantes
 */
export const getParticipantesByUsuario = async (usuarioId: string): Promise<any[]> => {
  try {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    const storageKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${usuarioId}`;
    
    const storedDataStr = await AsyncStorage.getItem(storageKey);
    const storedData = storedDataStr ? JSON.parse(storedDataStr) : null;
    const isDataExpired = storedData && (Date.now() - storedData.timestamp > EXPIRATION_TIME);
    
    if (isConnected && (!storedData || isDataExpired)) {
      const response = await api.get(`/participantes/usuario/${usuarioId}`);
      
      if (response.data && response.data.length > 0) {
        await AsyncStorage.setItem("hasParticipant", "true");
        await AsyncStorage.setItem("participantId", response.data[0].id.toString());
      } else {
        await AsyncStorage.setItem("hasParticipant", "false");
        await AsyncStorage.removeItem("participantId");
      }
      
      const dataToStore = {
        data: response.data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataToStore));
      
      return response.data;
    }
    
    if (storedData) {
      if (storedData.data && storedData.data.length > 0) {
        await AsyncStorage.setItem("hasParticipant", "true");
        await AsyncStorage.setItem("participantId", storedData.data[0].id.toString());
      } else {
        await AsyncStorage.setItem("hasParticipant", "false");
        await AsyncStorage.removeItem("participantId");
      }
      
      return storedData.data;
    }
    
    throw new Error("Sem conexão e nenhum dado salvo anteriormente");
  } catch (error: any) {
    try {
      const storageKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${usuarioId}`;
      const storedDataStr = await AsyncStorage.getItem(storageKey);
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        return storedData.data;
      }
    } catch (localError) {
    }
    
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar participantes do usuário.";
    throw new Error(errorMessage);
  }
};

/**
 * Obtém todos os participantes
 * @returns Retorna uma lista de todos os participantes
 * @throws Lança um erro caso ocorra alguma falha ao buscar os participantes
 */
export const getAllParticipantes = async (): Promise<any[]> => {
  try {
    const response = await api.get(`/participantes`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao buscar participantes.";
    throw new Error(errorMessage);
  }
};

/**
 * Atualiza os dados de um participante específico
 * @param participantId ID do participante
 * @param data Objeto contendo os dados atualizados do participante
 * @throws Lança um erro caso a atualização falhe
 */
export const updateParticipante = async (
  participantId: string, 
  data: ParticipantePayload
): Promise<void> => {
  try {
    const response = await api.patch(`/participantes/${participantId}`, data);
    
    await invalidateParticipantCache();
    await AsyncStorage.setItem("hasParticipant", "true");
    await AsyncStorage.setItem("participantId", participantId);
    
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const storageKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${userId}`;
      const storedDataStr = await AsyncStorage.getItem(storageKey);
      
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        const updatedData = storedData.data.map((participant: any) => {
          if (participant.id.toString() === participantId) {
            return { ...participant, ...data };
          }
          return participant;
        });
        
        storedData.data = updatedData;
        storedData.timestamp = Date.now();
        await AsyncStorage.setItem(storageKey, JSON.stringify(storedData));
      }
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao atualizar participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Deleta um participante específico
 * @param participantId ID do participante a ser deletado
 * @throws Lança um erro caso a exclusão falhe
 */
export const deleteParticipante = async (participantId: string): Promise<void> => {
  try {
    await api.delete(`/participantes/${participantId}`);
    
    await invalidateParticipantCache();
    
    const currentParticipantId = await AsyncStorage.getItem("participantId");
    if (currentParticipantId === participantId) {
      await AsyncStorage.removeItem("participantId");
    }
    
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const storageKey = `${STORAGE_KEYS.USER_PARTICIPANTES}${userId}`;
      const storedDataStr = await AsyncStorage.getItem(storageKey);
      
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        const filteredData = storedData.data.filter((participant: any) => 
          participant.id.toString() !== participantId);
        
        storedData.data = filteredData;
        storedData.timestamp = Date.now();
        await AsyncStorage.setItem(storageKey, JSON.stringify(storedData));
        
        if (filteredData.length === 0) {
          await AsyncStorage.setItem("hasParticipant", "false");
        }
      }
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao excluir participante.";
    throw new Error(errorMessage);
  }
};

/**
 * Invalida o cache de verificação de participante para forçar nova consulta
 */
export const invalidateParticipantCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("hasParticipant");
  } catch (error) {
    throw error
  }
};

/**
 * Verifica se existe um participante vinculado ao usuário
 * @returns Retorna true se o participante existir, caso contrário false
 */
export const checkParticipantExists = async (): Promise<boolean> => {
  try {
    const hasParticipantStorage = await AsyncStorage.getItem("hasParticipant");
    const participantId = await AsyncStorage.getItem("participantId");
    
    if (hasParticipantStorage === "true" && participantId) {
      return true;
    }
    
    if (hasParticipantStorage === "false") {
      return false;
    }
    
    const userId = await AsyncStorage.getItem("userId");
    
    if (userId) {
      try {
        const participants = await getParticipantesByUsuario(userId);
        const hasParticipant = participants && participants.length > 0;
        
        await AsyncStorage.setItem("hasParticipant", hasParticipant.toString());
        if (hasParticipant && participants[0]?.id) {
          await AsyncStorage.setItem("participantId", participants[0].id.toString());
        }
        
        return hasParticipant;
      } catch (error) {
        return hasParticipantStorage === "false";
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};
