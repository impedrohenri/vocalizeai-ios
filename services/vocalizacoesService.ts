import { Vocalizacao } from "@/types/Vocalizacao";
import { api } from "./api";
import { getRole, getUserId } from "./util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

/**
 * Obtém a lista de todas as vocalizações salva no AsyncStorage,
 * verifica se os dados estão armazenados localmente e se estão expirados.
 * Se não houver conexão com a internet, tenta usar os dados armazenados
 * @param forceRefresh Se true, força a busca na API mesmo com dados em cache válidos
 * @returns Lista de vocalizações
 * @throws Lança um erro caso ocorra alguma falha ao buscar as vocalizações
 */
export const getVocalizacoes = async (forceRefresh: boolean = false): Promise<Vocalizacao[]> => {
  const STORAGE_KEY = "vocalizations";
  
  const getStoredData = async (): Promise<{data: Vocalizacao[], timestamp: number} | null> => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      return null;
    }
  };

  const fetchFromApi = async (): Promise<Vocalizacao[]> => {
    try {
      const response = await api.get("/vocalizacoes");
      
      const dataToStore = {
        data: response.data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  try {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    const storedData = await getStoredData();
    
    const EXPIRATION_TIME = 24 * 60 * 60 * 1000;
    const isDataExpired = storedData && 
      (Date.now() - storedData.timestamp > EXPIRATION_TIME);
    
    if (isConnected && (!storedData || isDataExpired || forceRefresh)) {
      return await fetchFromApi();
    } 
    
    if (storedData) {
      return storedData.data;
    }
    
    throw new Error("Sem conexão e nenhum dado salvo anteriormente");
    
  } catch (error: unknown) {
    const storedData = await getStoredData();
    if (storedData) {
      return storedData.data;
    }
    
    let errorMessage = "Erro ao buscar vocalizações.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const apiError = error as {response?: {data?: {detail?: string}}};
      errorMessage = apiError.response?.data?.detail || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Cria uma nova vocalização
 * @param nome Nome da vocalização
 * @param descricao Descrição da vocalização
 * @throws Lança um erro caso nome ou descrição não sejam fornecidos ou ocorra falha ao criar
 */
export const createVocalizacoes = async (nome: string, descricao: string): Promise<void> => {
  const STORAGE_KEY = "vocalizations";
  
  try {
    if (!nome || !descricao) {
      throw new Error("Nome e descrição são obrigatórios.");
    }

    const response = await api.post(`/vocalizacoes`, { nome, descricao });
    
    const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedDataStr) {
      const storedData = JSON.parse(storedDataStr);
      storedData.data.push(response.data);
      storedData.timestamp = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } else {
      const newData = {
        data: [response.data],
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao criar vocalizações.";
    throw new Error(errorMessage);
  }
};

/**
 * Atualiza uma vocalização específica
 * @param vocalizacaoId ID da vocalização a ser atualizada
 * @param data Objeto contendo os dados da vocalização
 * @throws Lança um erro caso o usuário não tenha permissão ou ocorra falha na atualização
 */
export const updateVocalizacoes = async (vocalizacaoId: string, data: Vocalizacao): Promise<void> => {
  const STORAGE_KEY = "vocalizations";
  
  try {
    const role = await getRole()
    const userId = await getUserId()

    if (role != "admin" && data.id_usuario != Number(userId)) {
      throw new Error("Você não tem permissão para atualizar vocalizações.");
    }

    await api.patch(`/vocalizacoes/${vocalizacaoId}`, data);
    
    const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedDataStr) {
      const storedData = JSON.parse(storedDataStr);
      const updatedData = storedData.data.map((vocalizacao: Vocalizacao) => {
        if (vocalizacao.id.toString() === vocalizacaoId) {
          return { ...vocalizacao, ...data };
        }
        return vocalizacao;
      });
      
      storedData.data = updatedData;
      storedData.timestamp = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao atualizar vocalizações.";
    throw new Error(errorMessage);
  }
};

/**
 * Deleta uma vocalização específica
 * @param vocalizacaoId ID da vocalização a ser deletada
 * @throws Lança um erro caso o usuário não tenha permissão ou ocorra falha na exclusão
 */
export const deleteVocalizacoes = async (vocalizacaoId: string): Promise<void> => {
  const STORAGE_KEY = "vocalizations";
  
  try {
    const role = await getRole()

    if (role !== "admin") {
      throw new Error("Você não tem permissão para deletar vocalizações.");
    }

    await api.delete(`/vocalizacoes/${vocalizacaoId}`);
    
    const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedDataStr) {
      const storedData = JSON.parse(storedDataStr);
      const updatedData = storedData.data.filter((vocalizacao: Vocalizacao) => 
        vocalizacao.id.toString() !== vocalizacaoId);
      
      storedData.data = updatedData;
      storedData.timestamp = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao deletar vocalizações.";
    throw new Error(errorMessage);
  }
};