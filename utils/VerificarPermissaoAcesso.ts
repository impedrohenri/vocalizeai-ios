import { router } from "expo-router";

export const verificarPermissaoAcesso = async (permissao: boolean = false, bloquear_usuario: boolean = true, onSuccess: string = "/(tabs)") => {
    console.log(permissao)
    if (permissao && onSuccess === "/(tabs)") {
      return router.replace("/(tabs)");
    } else if (!permissao && bloquear_usuario) {
      return router.replace("/auth/aguardar-acesso");
    }
  }