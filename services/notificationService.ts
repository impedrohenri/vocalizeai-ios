import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  
  private readonly LAST_APP_OPEN_KEY = '@vocalizeai_last_app_open';
  private readonly PENDING_AUDIO_NOTIFICATION_ID = '@vocalizeai_pending_audio_notification';
  private readonly INACTIVE_USER_NOTIFICATION_ID = '@vocalizeai_inactive_user_notification';
  
  private readonly PENDING_AUDIO_CHECK_INTERVAL = 24 * 60 * 60;
  private readonly INACTIVE_USER_CHECK_INTERVAL = 7 * 24 * 60 * 60;
  

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VocalizeAI Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    return true;
  }

  async recordAppOpen(): Promise<void> {
    const timestamp = Date.now();
    await AsyncStorage.setItem(this.LAST_APP_OPEN_KEY, timestamp.toString());
  }

  async getLastAppOpen(): Promise<number> {
    const timestamp = await AsyncStorage.getItem(this.LAST_APP_OPEN_KEY);
    return timestamp ? parseInt(timestamp) : Date.now();
  }

  async checkPendingAudios(): Promise<boolean> {
    try {
      const audiosData = await AsyncStorage.getItem('@vocalizeai_audios');
      if (!audiosData) return false;

      const audios = JSON.parse(audiosData);
      return audios.some((audio: any) => audio.status === 'pending');
    } catch (error) {
      return false;
    }
  }

  async schedulePendingAudioNotification(): Promise<void> {
    try {
      const existingId = await AsyncStorage.getItem(this.PENDING_AUDIO_NOTIFICATION_ID);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }

      const interval = this.PENDING_AUDIO_CHECK_INTERVAL;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'VocalizeAI',
          body: 'Você tem áudios gravados que ainda não foram enviados para a nossa base de dados. Que tal fazer o envio?',
          data: { type: 'pending_audio' },
          sound: true,
          ...(Platform.OS === 'android' && {
            icon: 'ic_white_v_notification',
            categoryIdentifier: 'audio_reminder',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: interval,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(this.PENDING_AUDIO_NOTIFICATION_ID, notificationId);
    } catch (error) {
    }
  }

  async scheduleInactiveUserNotification(): Promise<void> {
    try {
      const existingId = await AsyncStorage.getItem(this.INACTIVE_USER_NOTIFICATION_ID);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }

      const interval = this.INACTIVE_USER_CHECK_INTERVAL;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'VocalizeAI sente sua falta!',
          body: 'O VocalizeAI sente sua falta! Sempre que puder, aproveite para registrar novas vocalizações.',
          data: { type: 'inactive_user' },
          sound: true,
          ...(Platform.OS === 'android' && {
            icon: 'ic_white_v_notification',
            categoryIdentifier: 'user_engagement',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: interval,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(this.INACTIVE_USER_NOTIFICATION_ID, notificationId);
    } catch (error) {
      
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(this.PENDING_AUDIO_NOTIFICATION_ID);
      await AsyncStorage.removeItem(this.INACTIVE_USER_NOTIFICATION_ID);
    } catch (error) {
    }
  }

  async initialize(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return;
    }

    await this.recordAppOpen();

    const hasPendingAudios = await this.checkPendingAudios();
    if (hasPendingAudios) {
      await this.schedulePendingAudioNotification();
    }

    await this.scheduleInactiveUserNotification();
  }

  async updateNotifications(): Promise<void> {
    const hasPendingAudios = await this.checkPendingAudios();
    
    if (hasPendingAudios) {
      await this.schedulePendingAudioNotification();
    } else {
      const existingId = await AsyncStorage.getItem(this.PENDING_AUDIO_NOTIFICATION_ID);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem(this.PENDING_AUDIO_NOTIFICATION_ID);
      }
    }
  }

  async listScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications;
    } catch (error) {
      return [];
    }
  }
}

export default NotificationService.getInstance();
