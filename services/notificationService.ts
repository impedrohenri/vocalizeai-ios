import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  private readonly PENDING_AUDIO_CHECK_INTERVAL = 24 * 60 * 60; // 24 horas (1 vez por dia)
  private readonly INACTIVE_USER_CHECK_INTERVAL = 7 * 24 * 60 * 60; // 168 horas (1 vez por semana)

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

      const hasPendingAudios = await this.checkPendingAudios();
      if (!hasPendingAudios) {
        return;
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
          repeats: false,
        },
      });

      await AsyncStorage.setItem(this.PENDING_AUDIO_NOTIFICATION_ID, notificationId);
      this.scheduleRecurringCheck('pending_audio');
    } catch (error) {
      console.warn('Erro ao agendar notificação de áudios pendentes:', error);
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
          repeats: false,
        },
      });

      await AsyncStorage.setItem(this.INACTIVE_USER_NOTIFICATION_ID, notificationId);
      
      this.scheduleRecurringCheck('inactive_user');
    } catch (error) {
      console.warn('Erro ao agendar notificação de usuário inativo:', error);
    }
  }

  private async scheduleRecurringCheck(type: 'pending_audio' | 'inactive_user'): Promise<void> {
    let intervals: number[];
    
    if (type === 'pending_audio') {
      intervals = [];
      for (let day = 1; day <= 30; day++) {
        intervals.push(day * 24);
      }
    } else {
      intervals = [];
      for (let week = 1; week <= 24; week++) {
        intervals.push(week * 168);
      }
    }
    
    for (const hours of intervals) {
      try {
        const content = type === 'pending_audio' 
          ? {
              title: 'VocalizeAI',
              body: 'Você tem áudios gravados que ainda não foram enviados para a nossa base de dados. Que tal fazer o envio?',
              data: { type: 'pending_audio' },
            }
          : {
              title: 'VocalizeAI sente sua falta!',
              body: 'O VocalizeAI sente sua falta! Sempre que puder, aproveite para registrar novas vocalizações.',
              data: { type: 'inactive_user' },
            };

        await Notifications.scheduleNotificationAsync({
          content: {
            ...content,
            sound: true,
            ...(Platform.OS === 'android' && {
              icon: 'ic_white_v_notification',
              categoryIdentifier: type === 'pending_audio' ? 'audio_reminder' : 'user_engagement',
              priority: Notifications.AndroidNotificationPriority.HIGH,
            }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: hours * 60 * 60,
            repeats: false,
          },
        });
      } catch (error) {
        console.warn(`Erro ao agendar notificação recorrente ${type} para ${hours}h:`, error);
      }
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

    await this.cancelAllNotifications();

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

    await this.scheduleInactiveUserNotification();
  }

  async refreshNotificationsOnAppOpen(): Promise<void> {
    try {
      const scheduledNotifications = await this.listScheduledNotifications();
      const hasPendingAudioNotif = scheduledNotifications.some(n => n.content.data?.type === 'pending_audio');
      const hasInactiveUserNotif = scheduledNotifications.some(n => n.content.data?.type === 'inactive_user');

      const hasPendingAudios = await this.checkPendingAudios();

      if (hasPendingAudios && !hasPendingAudioNotif) {
        await this.schedulePendingAudioNotification();
      } else if (!hasPendingAudios && hasPendingAudioNotif) {
        await this.cancelPendingAudioNotifications();
      }

      if (!hasInactiveUserNotif) {
        await this.scheduleInactiveUserNotification();
      }

      await this.recordAppOpen();
    } catch (error) {
      console.warn('Erro ao atualizar notificações na abertura do app:', error);
    }
  }

  private async cancelPendingAudioNotifications(): Promise<void> {
    const existingId = await AsyncStorage.getItem(this.PENDING_AUDIO_NOTIFICATION_ID);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(this.PENDING_AUDIO_NOTIFICATION_ID);
    }

    const scheduledNotifications = await this.listScheduledNotifications();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === 'pending_audio') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
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
