import * as FileSystem from 'expo-file-system/legacy';


const AUDIO_DIR = FileSystem.documentDirectory + 'audio/';

const FileOperationsModule = {
  /**
   * Retorna o diretório de áudio, criando-o se não existir.
   */
  async getAudioDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
      
      if (!dirInfo.exists) {
        console.log("Diretório de áudio não existe, criando...", AUDIO_DIR);
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
      }
      
      return AUDIO_DIR;
    } catch (error) {
      console.error('Erro ao obter/criar diretório de áudio:', error);
      return AUDIO_DIR; 
    }
  },

  /**
   * Deleta um arquivo específico.
   */
  async deleteFile(filePath) {
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  },

  /**
   * Limpa todo o conteúdo da pasta de áudio.
   */
  async cleanAudioDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);

      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(AUDIO_DIR);
        let deletedCount = 0;

        for (const file of files) {
          try {
            const filePath = AUDIO_DIR + file;
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            deletedCount++;
          } catch (error) {
            console.error(`Falha ao deletar ${file}:`, error);
          }
        }
        return deletedCount;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao limpar diretório de áudio:', error);
      return 0;
    }
  },

  /**
   * Move um arquivo de um lugar para outro.
   */
  async moveFile(sourcePath, destPath) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(sourcePath);
      
      if (fileInfo.exists) {
        await FileSystem.moveAsync({
          from: sourcePath,
          to: destPath
        });
        return true;
      } else {
        console.warn('Arquivo de origem não existe para mover:', sourcePath);
        return false;
      }
    } catch (error) {
      console.error('Erro ao mover arquivo:', error);
      return false;
    }
  }
};

export default FileOperationsModule;