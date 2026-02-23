import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { api, apiPublic } from "./api";
import { saveTokens, clearTokens, checkAndClearOldCache } from "./util";
import { jwtDecode } from 'jwt-decode';
import { verificarPermissaoAcesso } from "@/utils/VerificarPermissaoAcesso";

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Decodifica o payload do JWT
 * @param token Token JWT para decodificar
 * @returns Payload decodificado do token
 */
const decodeToken = (token: string): TokenPayload => {
  return jwtDecode<TokenPayload>(token);
};

/**
 * Salva as credenciais do usuário para login automático
 * @param email Email do usuário
 * @param senha Senha do usuário
 * @param rememberMe Se deve lembrar as credenciais
 */
const saveCredentials = async (email: string, senha: string, rememberMe: boolean = true): Promise<void> => {
  if (rememberMe) {
    await AsyncStorage.multiSet([
      ["saved_email", email],
      ["saved_password", senha]
    ]);
  }
};

/**
 * Remove as credenciais salvas
 */
const clearSavedCredentials = async (): Promise<void> => {
  await AsyncStorage.multiRemove(["saved_email", "saved_password"]);
};

/**
 * Verifica se existem credenciais salvas
 * @returns true se existem credenciais salvas
 */
const hasSavedCredentials = async (): Promise<boolean> => {
  const savedEmail = await AsyncStorage.getItem("saved_email");
  const savedPassword = await AsyncStorage.getItem("saved_password");
  return !!(savedEmail && savedPassword);
};

/**
 * Efetua login do usuário
 * @param email Email do usuário
 * @param senha Senha do usuário
 * @param rememberMe Se deve lembrar as credenciais para login automático
 * @returns Retorna uma string que indica o status do login: 'success', 'unverified' ou 'error'
 */
const doLogin = async (email: string, senha: string, rememberMe: boolean = true): Promise<string> => {
  try {
    const response = await api.post("/auth/login", { email, senha });
    const { access_token, refresh_token } = response.data;

    if (access_token && refresh_token) {
      const payload = decodeToken(access_token);
      
      await saveTokens(access_token, refresh_token, payload.sub, payload.role);
      
      if (rememberMe) {
        await saveCredentials(email, senha, true);
      }
      
      const cacheCleared = await checkAndClearOldCache();
      if (cacheCleared) {
        Toast.show({
          type: "info",
          text1: "Cache atualizado",
          text2: "Dados antigos foram limpos para garantir compatibilidade",
        });
      }
      
      try {
        const userResponse = await apiPublic.get(`/usuarios/${payload.sub}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        if (userResponse.data?.nome) {
          await AsyncStorage.setItem("username", userResponse.data.nome);
        } else {
          await AsyncStorage.setItem("username", email.split('@')[0]);
        }
        await AsyncStorage.setItem("acessoPermitido", String(userResponse.data.acesso_permitido));
        verificarPermissaoAcesso(userResponse.data.acesso_permitido);
      } catch (userError) {
        await AsyncStorage.setItem("username", email.split('@')[0]);
      }
      
      Toast.show({
        type: "success",
        text1: "Login realizado com sucesso!",
        text2: "Bem-vindo ao VocalizeAI",
      });

      return "success";
    } else {
      Toast.show({
        type: "error",
        text1: "Erro ao fazer login",
        text2: "Resposta inválida do servidor.",
      });
      return "error";
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || error.message || "Erro ao fazer login.";
    
    if (error.response?.status === 403 && error.response?.data?.detail === "Usuário não verificado. Verifique seu e-mail para ativar sua conta.") {
      Toast.show({
        type: "error",
        text1: "Conta não verificada",
        text2: "Verifique seu e-mail para ativar sua conta.",
      });
      return "unverified";
    }
    
    Toast.show({
      type: "error",
      text1: "Erro ao fazer login",
      text2: errorMessage,
    });
    return "error";
  }
};

/**
 * Tenta fazer login automático com credenciais salvas
 * @returns true se o login automático foi bem-sucedido
 */
const tryAutoLogin = async (): Promise<boolean> => {
  try {
    const savedEmail = await AsyncStorage.getItem("saved_email");
    const savedPassword = await AsyncStorage.getItem("saved_password");
    
    if (!savedEmail || !savedPassword) {
      return false;
    }

    const result = await doLogin(savedEmail, savedPassword, false);
    return result === "success";
  } catch (error) {
    return false;
  }
};

/**
 * Registra um novo usuário
 * @param nome Nome do usuário
 * @param email Email do usuário
 * @param celular Número de celular do usuário
 * @param senha Senha do usuário
 * @param confirmaSenha Confirmação da senha
 * @param aceiteTermos Booleano indicando se o usuário aceitou os termos
 * @returns Retorna true se o cadastro foi bem sucedido, caso contrário false
 */
const register = async (
  nome: string,
  email: string,
  celular: string,
  senha: string,
  confirmaSenha: string,
  aceiteTermos: boolean
): Promise<boolean> => {
  if (!nome || !celular || !email || !senha || !confirmaSenha) {
    Toast.show({
      type: "error",
      text1: "Erro ao cadastrar usuário",
      text2: "Todos os campos são obrigatórios.",
    });
    return false;
  }

  if (!aceiteTermos) {
    Toast.show({
      type: "error",
      text1: "Erro ao cadastrar usuário",
      text2: "É necessário aceitar os termos de uso e política de privacidade.",
    });
    return false;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    Toast.show({
      type: "error",
      text1: "Erro ao cadastrar usuário",
      text2: "Formato do email é inválido.",
    });
    return false;
  }

  if (senha !== confirmaSenha) {
    Toast.show({
      type: "error",
      text1: "Erro ao cadastrar usuário",
      text2: "As senhas não coincidem.",
    });
    return false;
  }

  try {
    const response = await api.post("/auth/register", {
      nome,
      email,
      celular,
      senha,
      aceite_termos: aceiteTermos
    });
    
    if (response.status === 201) {
      Toast.show({
        type: "success",
        text1: "Cadastro realizado com sucesso!",
        text2: "Verifique seu e-mail para confirmar sua conta.",
      });
      return true;
    } else {
      Toast.show({
        type: "error",
        text1: "Erro ao cadastrar usuário",
        text2: "Erro inesperado. Tente novamente.",
      });
      return false;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.detail || error.message || "Erro ao cadastrar usuário.";
    Toast.show({
      type: "error",
      text1: "Erro ao cadastrar usuário",
      text2: errorMessage,
    });
    return false;
  }
};

/**
 * Envia um novo código de confirmação para o email do usuário
 * @param email Email do usuário para qual o código será enviado
 */
const sendConfirmationCode = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/resend-confirmation-code', { email });
    Toast.show({
      type: "success",
      text1: "Código enviado",
      text2: "Novo código de confirmação enviado para seu e-mail.",
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Erro ao enviar o código de confirmação.';
    Toast.show({
      type: "error",
      text1: "Erro",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Confirma o registro de um usuário utilizando código de confirmação
 * @param email Email do usuário
 * @param codigoConfirmacao Código recebido por email
 */
const confirmRegistration = async (email: string, codigoConfirmacao: string): Promise<void> => {
  try {
    await api.post('/auth/confirm-registration', { 
      email, 
      codigo_confirmacao: codigoConfirmacao
    });
    Toast.show({
      type: "success",
      text1: "Conta confirmada!",
      text2: "Sua conta foi ativada com sucesso.",
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Erro ao confirmar o cadastro.';
    Toast.show({
      type: "error",
      text1: "Erro",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Efetua o logout do usuário
 * @param clearCredentials Se deve limpar as credenciais salvas (padrão: false)
 */
const doLogout = async (clearCredentials: boolean = false): Promise<void> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    
    if (accessToken && refreshToken) {
      try {
        await api.post("/auth/logout", {
          refresh_token: refreshToken
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.warn("Erro no logout do servidor:", error);
      }
    }
  } catch (error) {
    console.warn("Erro ao obter tokens para logout do servidor:", error);
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    let keysToRemove = allKeys.filter(key => key !== "recordings");
    
    if (!clearCredentials) {
      keysToRemove = keysToRemove.filter(key => !["saved_email", "saved_password"].includes(key));
    }
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.warn("Erro ao limpar AsyncStorage:", error);
    await clearTokens();
    if (clearCredentials) {
      await clearSavedCredentials();
    }
  }
  
  router.push("/auth/login");
};

/**
 * Envia solicitação de redefinição de senha
 * @param email Email do usuário que deseja redefinir a senha
 */
const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/password-reset', { email });
    Toast.show({
      type: "success",
      text1: "Código enviado",
      text2: "Código de redefinição enviado para seu e-mail.",
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Erro ao solicitar redefinição de senha.';
    Toast.show({
      type: "error",
      text1: "Erro",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Redefine a senha do usuário
 * @param email Email do usuário
 * @param codigoConfirmacao Código de confirmação recebido
 * @param novaSenha Nova senha escolhida
 */
const resetPassword = async (email: string, codigoConfirmacao: string, novaSenha: string): Promise<void> => {
  try {
    await api.post('/auth/confirm-password-reset', {
      email,
      codigo_confirmacao: parseInt(codigoConfirmacao),
      nova_senha: novaSenha
    });
    
    const savedEmail = await AsyncStorage.getItem("saved_email");
    if (savedEmail === email) {
      await AsyncStorage.setItem("saved_password", novaSenha);
    }
    
    Toast.show({
      type: "success",
      text1: "Senha alterada",
      text2: "Sua senha foi redefinida com sucesso.",
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Erro ao redefinir senha.';
    Toast.show({
      type: "error",
      text1: "Erro",
      text2: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns true se o usuário está autenticado, false caso contrário
 */
const isAuthenticated = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    
    if (!accessToken) {
      if (await hasSavedCredentials()) {
        const autoLoginSuccess = await tryAutoLogin();
        return autoLoginSuccess;
      }
      return false;
    }

    const payload = decodeToken(accessToken);
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp <= now) {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: new_refresh_token } = response.data;
          
          await AsyncStorage.multiSet([
            ["access_token", access_token],
            ["refresh_token", new_refresh_token]
          ]);
          
          return true;
        } catch (refreshError) {
          if (await hasSavedCredentials()) {
            return await tryAutoLogin();
          }
        }
      } else if (await hasSavedCredentials()) {
        return await tryAutoLogin();
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    if (await hasSavedCredentials()) {
      return await tryAutoLogin();
    }
    return false;
  }
};

export { 
  confirmRegistration, 
  doLogin, 
  doLogout, 
  register, 
  requestPasswordReset, 
  resetPassword, 
  sendConfirmationCode,
  isAuthenticated,
  tryAutoLogin,
  hasSavedCredentials,
  clearSavedCredentials
};