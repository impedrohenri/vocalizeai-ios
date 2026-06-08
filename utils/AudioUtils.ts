import { Vocalizacao } from "@/types/Vocalizacao";

export const getVocalizationName = async (id_vocalizacao: number, vocalizations: Vocalizacao[]) => {
  const vocalization = vocalizations.find((v) => v.id === id_vocalizacao);
  return vocalization?.nome || "Desconhecida";
};

