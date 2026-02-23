import ButtonCustom from '@/components/Button'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

export default function aguardarAcesso() {
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    const getNome = async () => {
      const nome = await AsyncStorage.getItem("username");
      setNome(nome);
    };
    getNome();

  }, [])

  const handleSubmit = async () => {
    router.replace("/auth/login");
  }

  const abrirEmail = () => {
    Linking.openURL(`mailto:vocalizeai.app@gmail.com?subject=Informações%20sobre%20o%20VocalizeAI&body=Olá,%0D%0A%0D%0AGostaria%20de%20obter%20mais%20informações%20sobre%20o%20VocalizeAI%20e%20a%20pesquisa.%20Tenho%20interesse%20em%20entender%20melhor%20a%20proposta.%0D%0A%0D%0A${nome}`);
  };

  const abrirWhatsApp = () => {
    Linking.openURL("https://wa.me/5581985004475?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20VocalizeAI%20e%20a%20pesquisa");
  };

  const visitarSite = () => {
    Linking.openURL('https://www.vocalizeai.app.br');
  };

  return (
    <View style={{ flex: 1, justifyContent: "space-around", alignItems: 'center', gap: 40, backgroundColor: '#fff' }}>
      <View style={{ width: "85%", marginTop: 50 }}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>VocalizeAI</Text>
          <LinearGradient
            colors={["#2196F3", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.underline}
          />
        </View>
        <View >
          <Text style={{ fontSize: 15, textAlign: "center", marginTop: 30 }}>
            Entre em contato conosco para solicitar acesso ao aplicativo
          </Text>
          <Text style={{ fontSize: 15, textAlign: "center" }}>
            OU
          </Text>
          <Text style={{ fontSize: 15, textAlign: "center" }}>
            Aguarde que entraremos em contato com você.
          </Text>

          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              marginTop: 70,
              fontWeight: "bold",
              color: "#2196F3",
              textDecorationLine: "underline",
            }}
          >
            <Pressable onPress={abrirEmail} style={styles.row}>
              <MaterialIcons name="email" size={16} color="#2196F3" />
              <Text style={styles.linkText}>vocalizeai.app@gmail.com</Text>
            </Pressable>
              {"\n"}
              {"\n"}
            <Pressable onPress={abrirWhatsApp} style={styles.row}>
              <MaterialIcons name="message" size={16} color="#2196F3" />
              <Text style={styles.linkText}>+55 (81) 98500-4475</Text>
            </Pressable>
          </Text>
        </View>

      </View>

      <View style={{ width: "80%" }}>
        <ButtonCustom
          title="Voltar para o início"
          onPress={handleSubmit}
          color="#2196F3"
          style={styles.mainButton}
          icon={<MaterialIcons name="login" size={20} color="#FFF" />}
        />
      </View>


      <Text style={{ color: "#2196F3", fontSize: 15 }} onPress={visitarSite}>
        Conhecer o VocalizeAI
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  underline: {
    width: "50%",
    height: 3,
    marginTop: 8,
    borderRadius: 2,
  },
  logoContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  gradient: {
    borderRadius: 8,
    padding: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: "Quicksand-Bold",
    letterSpacing: 1.2,
    color: "#2196F3",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mainButton: {
    height: 48,
    borderRadius: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  linkText: {
    color: "#2196F3",
    fontSize: 17,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
})