import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Retorna o ID do usuário armazenado no AsyncStorage
 * @returns Uma string com o ID do usuário ou null se não encontrado
 */
export const getUserId = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("userId");
};

/**
 * Retorna o token de acesso armazenado no AsyncStorage
 * @returns Uma string com o access token ou null se não encontrado
 */
export const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("access_token");
}

/**
 * Retorna o refresh token armazenado no AsyncStorage
 * @returns Uma string com o refresh token ou null se não encontrado
 */
export const getRefreshToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("refresh_token");
}

/**
 * Retorna o papel (role) do usuário armazenado no AsyncStorage
 * @returns Uma string com a role do usuário ou null se não encontrado
 */
export const getRole = async (): Promise<string | null> => {
    return await AsyncStorage.getItem("role");
}

/**
 * Salva os tokens de autenticação no AsyncStorage
 * @param accessToken Token de acesso
 * @param refreshToken Token de refresh
 * @param userId ID do usuário
 * @param role Papel do usuário
 */
export const saveTokens = async (
    accessToken: string, 
    refreshToken: string, 
    userId: string, 
    role: string
): Promise<void> => {
    await AsyncStorage.multiSet([
        ["access_token", accessToken],
        ["refresh_token", refreshToken],
        ["userId", userId],
        ["role", role]
    ]);
};

/**
 * Remove todos os tokens de autenticação do AsyncStorage
 */
export const clearTokens = async (): Promise<void> => {
    await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token", 
        "token", 
        "tokenExpires", 
        "role", 
        "userId"
    ]);
};

const API_VERSION = "1.0.0";
const API_VERSION_KEY = "api_version";

/**
 * Verifica se a versão da API mudou e limpa dados antigos se necessário
 * @returns Promise<boolean> - true se os dados foram limpos, false caso contrário
 */
export const checkAndClearOldCache = async (): Promise<boolean> => {
    try {
        const storedVersion = await AsyncStorage.getItem(API_VERSION_KEY);
        
        if (storedVersion !== API_VERSION) {
            
            const cacheKeys = [
                "user_data",
                "vocalizations", 
                "hasParticipant",
                "participantId"
            ];
            
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToRemove = allKeys.filter(key => 
                cacheKeys.some(cacheKey => key.includes(cacheKey)) ||
                key.startsWith("user_participantes_") ||
                key.startsWith("user_audios_")
            );
            
            if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
            }
            
            await AsyncStorage.setItem(API_VERSION_KEY, API_VERSION);
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Erro ao verificar versão da API:", error);
        return false;
    }
};

/**
 * Força a limpeza de todo cache de dados (mantém tokens de autenticação)
 */
export const clearDataCache = async (): Promise<void> => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        
        const authKeys = ["access_token", "refresh_token", "userId", "role", "token", "tokenExpires"];
        const keysToRemove = allKeys.filter(key => !authKeys.includes(key) && key !== API_VERSION_KEY);
        
        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
        }
        
    } catch (error) {
        console.error("Erro ao limpar cache de dados:", error);
    }
};

/**
 * Obtém informações sobre o cache atual
 */
export const getCacheInfo = async (): Promise<{
    apiVersion: string | null;
    totalKeys: number;
    cacheKeys: string[];
}> => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const apiVersion = await AsyncStorage.getItem(API_VERSION_KEY);
        
        const authKeys = ["access_token", "refresh_token", "userId", "role", "token", "tokenExpires"];
        const cacheKeys = allKeys.filter(key => !authKeys.includes(key) && key !== API_VERSION_KEY);
        
        return {
            apiVersion,
            totalKeys: allKeys.length,
            cacheKeys
        };
    } catch (error) {
        console.error("Erro ao obter informações do cache:", error);
        return {
            apiVersion: null,
            totalKeys: 0,
            cacheKeys: []
        };
    }
};