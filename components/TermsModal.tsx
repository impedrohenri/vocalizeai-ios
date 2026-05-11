import ButtonCustom from "@/components/Button";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  initialAccepted?: boolean;
  onAcceptChange?: (accepted: boolean) => void;
}

export function TermsModal({
  visible,
  onClose,
  onAccept,
  initialAccepted = false,
  onAcceptChange,
}: TermsModalProps) {
  const [accepted, setAccepted] = useState(initialAccepted);

  useEffect(() => {
    setAccepted(initialAccepted);
  }, [initialAccepted]);

  const handleAccept = () => {
    const newAccepted = !accepted;
    setAccepted(newAccepted);

    if (onAcceptChange) {
      onAcceptChange(newAccepted);
    }
  };

  const visitarSite = () => {
    Linking.openURL('https://www.vocalizeai.app.br');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>
              Termo de Consentimento Livre e Esclarecido (TCLE)
            </Text>

            <Text style={styles.sectionTitle}>Pesquisa:</Text>
            <Text style={styles.paragraph}>
              A utilização de tecnologias assistivas para ampliar a capacidade
              de comunicação de pessoas que estão dentro do transtorno do
              espectro autista.
            </Text>

            <Text style={styles.sectionTitle}>Projeto:</Text>
            <Text style={styles.paragraph}>
              VocalizeAI: uma ferramenta de apoio à comunicação para pessoas
              autistas não verbais por meio da classificação de vocalizações
              utilizando inteligência artificial.
            </Text>

            <Text style={styles.paragraph}>
              Você está sendo convidado(a) à participar, de forma voluntária, de
              uma pesquisa científica realizada no Instituto Federal de
              Educação, Ciência e Tecnologia de Pernambuco (IFPE). Antes de
              decidir, é importante que você compreenda por que esta pesquisa
              está sendo realizada e o como será sua participação. Por favor,
              leia atentamente este documento. Em caso de dúvidas, você poderá
              entrar em contato com o pesquisador responsável.
            </Text>

            <Text style={styles.sectionTitle}>1. Objetivo da pesquisa</Text>
            <Text style={styles.paragraph}>
              Esta pesquisa tem como objetivo desenvolver uma ferramenta baseada
              em inteligência artificial capaz de auxiliar na interpretação das
              vocalizações de pessoas autistas não verbais.
            </Text>

            <Text style={styles.paragraph}>
              Para que isto seja possível, estamos utilizando nesta etapa da pesquisa
              um aplicativo que possibilita aos cuidadores e responsáveis coletar e
              classificar novas vocalizações emitidas por esses indivíduos. As
              vocalizações coletadas nesta fase, serão utilizadas para formar
              uma base de dados que será utilizada em um futuro próximo para
              treinar uma inteligência artificial e assim possibilitar o
              desenvolvimento de um novo aplicativo que consiga interpretar
              vocalizações automaticamente.
            </Text>

            <Text style={styles.sectionTitle}>2. Participação</Text>
            <Text style={styles.paragraph}>
              A participação consiste no uso do aplicativo, por meio do qual
              serão coletados e classificados áudios de vocalizações em cinco
              categorias: prazer, desregulação, frustração, solicitar, auto
              conversa e social. A participação é totalmente voluntária e você
              pode desistir a qualquer momento, sem qualquer prejuízo.
            </Text>

            <Text style={styles.sectionTitle}>3. Uso dos dados</Text>
            <Text style={styles.paragraph}>
              As vocalizações e classificações fornecidas serão utilizadas exclusivamente para fins de
              pesquisa científica e para o desenvolvimento de uma ferramenta de inteligência artificial. As
              gravações coletadas passarão por procedimentos de tratamento e anonimização, de modo
              a evitar a identificação dos participantes. Após esse processo, as vocalizações
              segmentadas serão disponibilizadas de forma pública para a comunidade científica, sem
              qualquer informação pessoal associada.
            </Text>
            <Text style={styles.paragraph}>
              O acesso aos dados pessoais estará restrito aos responsáveis pela pesquisa e nenhuma
              informação pessoal identificável será divulgada ou compartilhada com terceiros sem seu
              consentimento prévio. Seus dados pessoais serão tratados com confidencialidade e
              armazenados em ambiente seguro por um período de até 10 anos após a conclusão da
              pesquisa, já as vocalizações, permanecerão disponíveis por tempo indeterminado uma vez
              que sejam publicamente disponibilizadas. O participante poderá ainda solicitar a remoção
              de todos os seus dados a qualquer momento durante o decorrer da pesquisa, sendo essa
              solicitação atendida de forma imediata pelos pesquisadores responsáveis.
            </Text>

            <Text style={styles.sectionTitle}>4. Riscos e benefícios</Text>
            <Text style={styles.paragraph}>
              A participação neste estudo envolve o risco de quebra de confidencialidade por meio da
              identificação da vocalização. Como os áudios irão compor uma base de dados pública,
              existe a possibilidade de que a identidade do participante seja reconhecida por pessoas
              próximas através das vocalizações, ainda que qualquer menção direta a nomes ou dados
              identificadores seja removida do conteúdo.
            </Text>
            <Text style={styles.paragraph}>
              Os participantes da pesquisa, estarão contribuindo de maneira decisiva para gerar dados
              que possibilitem, num futuro próximo, que a universidade disponibilize gratuitamente para a
              sociedade um aplicativo que terá a capacidade de "traduzir" as vocalizações emitidas por
              indivíduos autistas não verbais. Como as “amostras” de vocalizações serão geradas pelos
              participantes, estes terão o benefício de que o app criado terá maior assertividade se usado
              com as próprias crianças participantes do processo de coleta. Sendo assim, essas pessoas
              terão a oportunidade de usar o app em diversos ambientes, como na escola por exemplo,
              para que essas pessoas possam ter suas emoções e sentimentos “traduzidos” nas
              interações com outras pessoas desconhecidas. Desta forma, entende-se que os
              participantes da pesquisa serão diretamente beneficiados no futuro com a utilização do
              aplicativo.
            </Text>
            <Text style={styles.paragraph}>
              A sua colaboração contribuirá para o avanço científico no campo da comunicação
              alternativa para pessoas autistas não verbais, podendo gerar impactos positivos na
              qualidade de vida desses indivíduos e de seus cuidadores.
            </Text>


            <Text style={styles.sectionTitle}>5. Confidencialidade</Text>
            <Text style={styles.paragraph}>
              As informações fornecidas serão mantidas sob sigilo e usadas
              apenas para os fins desta pesquisa. Os dados pessoais dos
              participantes não serão divulgados publicamente nem repassados a
              terceiros.
            </Text>

            <Text style={styles.sectionTitle}>
              6. Esclarecimentos e contato
            </Text>
            <Text style={styles.paragraph}>
              Se você tiver qualquer dúvida sobre a pesquisa, seus direitos
              enquanto participante, ou quiser mais informações, entre em
              contato com o pesquisador responsável:
            </Text>
            <Text style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Nome: </Text>
              <Text>Professor Roberto Luiz S. de Alencar{"\n"}</Text>
              <Text style={styles.contactLabel}>E-mail: </Text>
              <Text>roberto.alencar@jaboatao.ifpe.edu.br{"\n"}</Text>
              <Text style={styles.contactLabel}>Instituição: </Text>
              <Text>
                Instituto Federal de Educação, Ciência e Tecnologia de
                Pernambuco (IFPE){"\n"}
              </Text>
              <Text style={styles.contactLabel}>Campus: </Text>
              <Text>Jaboatão dos Guararapes</Text>
            </Text>

            <Text>
              Mais informações sobre o projeto em: <Text style={styles.link} onPress={() => visitarSite()}>https://www.vocalizeai.app.br</Text>
            </Text>

            <View style={styles.divider} />

            <Text style={styles.declaration}>
              Declaro que li e compreendi as informações acima, que tive a
              oportunidade de esclarecer dúvidas e que concordo, de forma livre
              e esclarecida, em participar da presente pesquisa.
            </Text>

            <TouchableOpacity
              style={styles.radioContainer}
              onPress={handleAccept}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {accepted && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={styles.radioText}>Li e aceito os termos acima.</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <ButtonCustom
              title="Fechar"
              onPress={onClose}
              color="black"
              style={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  scrollView: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 10,
  },
  contactLabel: {
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  declaration: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "justify",
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  radioText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closeButton: {
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
