import ButtonCustom from "@/components/Button";
import ConfirmationModal from "@/components/ConfirmationModal";
import Input from "@/components/Inputs/Input";
import {
  deleteUser,
  getAllUsers,
  updateUserAdmin,
  validarEmail,
} from "@/services/usuarioService";
import { Usuario } from "@/types/Usuario";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { UsuarioUpdate } from "../../../types/UsuarioUpdate";
import { api } from "@/services/api";
import { getAllParticipantes } from "@/services/participanteService";

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [celularError, setCelularError] = useState("");
  const [sortOption, setSortOption] = useState<'data' | 'alfabetica'>('data');

  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (text && !validarEmail(text)) {
      setEmailError("Formato de email inválido.");
    } else {
      setEmailError("");
    }
  };

  const handleCelularChange = (text: string) => {
    setCelular(text);

    if (!text || text.length < 11) {
      setCelularError("Celular inválido");
    } else {
      setCelularError("");
    }
  };

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const users = await getAllUsers();
      setUsuarios(users);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Não foi possível carregar os usuários",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchParticipantes = async () => {
      setIsLoading(true);
      try {
        const data = await getAllParticipantes();
        setParticipantes(data);
  
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: error instanceof Error ? error.message : "Erro",
          text2: "Não foi possível carregar os participantes",
        });
      } finally {
        setIsLoading(false);
      }
    }

  useFocusEffect(
    useCallback(() => {
      fetchUsuarios();
      fetchParticipantes();
    }, [fetchUsuarios])
  );

  const usuariosOrdenados = useMemo(() => {
    const lista = [...usuarios];
    
    if (sortOption === 'alfabetica') {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      // Ordenação por data (os mais antigos primeiro)
      return lista.sort((a, b) => {
        const dataA = new Date(a.created_at).getTime();
        const dataB = new Date(b.created_at).getTime();
        return dataA - dataB;
      });
    }
  }, [usuarios, sortOption]);

  const handleEdit = (usuario: UsuarioUpdate) => {
    setSelectedUsuario(usuario);
    setNome(usuario.nome || "");
    setEmail(usuario.email || "");
    setCelular(usuario.celular || "");
    setEmailError("");
    setCelularError("");
    setShowModal(true);
  };

  const handleViewAudios = (usuario: Usuario) => {
    router.push({
      pathname: "/admin/audios/[id]",
      params: { 
        id: usuario.id,
        fromScreen: "usuarios"
      }
    });
  };

  const validateForm = () => {
    let isValid = true;

    if (!nome.trim()) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "O nome é obrigatório",
      });
      isValid = false;
    }

    if (celular && celular.replace(/\D/g, "").length < 10) {
      setCelularError("Celular inválido");
      Toast.show({
        type: "error",
        text1: "Número de celular inválido",
      });
      isValid = false;
    }

    if (email && !validarEmail(email)) {
      setEmailError("Formato de email inválido");
      Toast.show({
        type: "error",
        text1: "Formato de email inválido",
      });
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!selectedUsuario) return;
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData: Usuario = {
        id: selectedUsuario.id,
        nome: nome.trim(),
        email: email.trim(),
        celular: celular.trim(),
      };

      await updateUserAdmin(updateData);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Dados do usuário atualizados com sucesso!",
      });

      setShowModal(false);
      await fetchUsuarios();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Erro ao atualizar os dados do usuário",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;

    try {
      await deleteUser(selectedUsuario.id);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Usuário deletado com sucesso!",
      });

      setShowConfirmModal(false);
      fetchUsuarios();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Erro ao deletar o usuário",
      });
    }
  };

  const permitirAcesso = async (id: number) => {
    try {
      const resp = await api.post(`/usuarios/${id}/permitir-ou-revogar-acesso`);
      if (resp.data.acesso_permitido) {
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Acesso permitido para o usuário!",
        });
      } else if (!resp.data.acesso_permitido) {
        Toast.show({
          type: "info",
          text1: "Acesso revogado",
          text2: "O acesso do usuário foi revogado.",
        });
      }
      fetchUsuarios();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "Erro",
        text2: "Erro ao permitir acesso para o usuário",
      });
    }
  }

  const renderUsuario = ({ item }: { item: Usuario & { acesso_permitido: boolean, codigo_convite: string, created_at: string } }) => {
    const qntdParticipantes = participantes.filter((p) => p.id_usuario === item.id).length;
    
    return (
    <View style={styles.userContainer}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => handleViewAudios(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.nome}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
              style={styles.iconButton}
            >
              <MaterialIcons name="edit" size={24} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedUsuario(item);
                setShowConfirmModal(true);
              }}
              style={styles.iconButton}
            >
              <MaterialIcons name="delete" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <Text style={styles.detailText}>{item.celular}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.detailText}>
              Cadastrado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          
            {(item.acesso_permitido || item.codigo_convite) && 
              <View style={styles.detailRow}>
                <MaterialIcons name="confirmation-number" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {item.codigo_convite ? `Convite: ${item.codigo_convite}` : 'Aprovado manualmente'}
                </Text>
              </View>
            }

          <View style={styles.detailRow}>
            <MaterialIcons name="lock" size={20} color="#666" />
            <Text style={styles.detailText}>
             Qntd. Participantes: {qntdParticipantes}
            </Text>
          </View>

          <View >
            <Pressable onPress={() => {permitirAcesso(item.id)}}style={styles.detailRow}>
  
              {item.acesso_permitido ? 
              <>
              <MaterialIcons name="lock-open" size={20} color="#666" /> 
              <Text style={{color: "#c00"}}>Revogar acesso</Text>
              </> : 
              <>
              <MaterialIcons name="lock" size={20} color="#666" />
              <Text style={{color: "#2196F3"}}>Permitir Acesso</Text>
              </>}
            </Pressable>
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );}

  return (
    <View style={styles.container}>
      {/* Container de Filtros de Ordenação */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.sortButtonsContainer}>
          <TouchableOpacity 
            style={[styles.sortButton, sortOption === 'data' && styles.sortButtonActive]}
            onPress={() => setSortOption('data')}
          >
            <MaterialIcons name="access-time" size={16} color={sortOption === 'data' ? '#2196F3' : '#666'} />
            <Text style={[styles.sortButtonText, sortOption === 'data' && styles.sortButtonTextActive]}>
              Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortOption === 'alfabetica' && styles.sortButtonActive]}
            onPress={() => setSortOption('alfabetica')}
          >
            <MaterialIcons name="sort-by-alpha" size={16} color={sortOption === 'alfabetica' ? '#2196F3' : '#666'} />
            <Text style={[styles.sortButtonText, sortOption === 'alfabetica' && styles.sortButtonTextActive]}>
              A-Z
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={usuariosOrdenados}
        renderItem={renderUsuario}
        keyExtractor={(usuario) => usuario.id.toString()}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="person-off" size={48} color="#666" />
              <Text style={styles.emptyText}>Não há usuários cadastrados.</Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={fetchUsuarios}
      />

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Usuário</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalClose}
                disabled={isLoading}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Input
              label="Nome"
              value={nome}
              onChangeText={setNome}
              editable={!isLoading}
              maxLength={50}
              showCharacterCount={true}
            />
            <Input
              label="Email"
              placeholder="Informe seu email"
              value={email}
              showCharacterCount={true}
              maxLength={80}
              onChangeText={handleEmailChange}
              leftIcon={<MaterialIcons name="email" size={20} color="#666" />}
              keyboardType="email-address"
              error={!!emailError}
              errorMessage={emailError}
            />
            <Input
              label="Celular"
              placeholder="Informe seu número de celular"
              keyboardType="phone-pad"
              value={celular}
              maxLength={15}
              mask="(99) 99999-9999"
              onChangeText={handleCelularChange}
              leftIcon={
                <MaterialIcons name="phone-android" size={20} color="#666" />
              }
              error={!!celularError}
              errorMessage={celularError}
            />

            <View style={styles.modalActions}>
              <ButtonCustom
                title="Salvar"
                onPress={handleSave}
                color="#2196F3"
                style={styles.modalButton}
                icon={<MaterialIcons name="save" size={20} color="#FFF" />}
                disabled={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        message="Tem certeza que deseja deletar este usuário?"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    paddingTop: 10,
  },
  // --- Novos estilos para o container de ordenação ---
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  // --------------------------------------------------
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  userContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    padding: 16,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
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
    gap: 16,
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
});
