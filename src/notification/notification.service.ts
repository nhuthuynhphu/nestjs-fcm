import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PushNotificationEnum } from 'src/constants/enums';
import { IPayloadPushNotification } from 'src/constants/interfaces';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  pushNotification = async (
    fcmToken: string,
    type: PushNotificationEnum,
    payload: IPayloadPushNotification,
  ): Promise<any> => {
    const FIREBASE_FCM_SERVER_KEY = process.env.FIREBASE_FCM_SERVER_KEY;
    if (!FIREBASE_FCM_SERVER_KEY) {
      this.logger.error('Missing firebase fcm server key');
      throw new Error('MISSING_FIREBASE_FCM_SERVER_KEY');
    }
    // const { device } = payload.extraData;
    const notificationPayload = {
      sound: 'default',
      type,
      title: payload.title,
      body: payload.body,
      badge: payload.badge,
      priority: 'high',
    };
    const fcmBody = {
      to: fcmToken,
      notification: notificationPayload,
      data: payload.data,
    };
    this.logger.log(
      `[deviceId] FcmBody Sending>>>`,
      // { device, fcmBody },
    );
    try {
      const response = await axios({
        method: 'POST',
        url: process.env.FIREBASE_FCM_URI,
        data: JSON.stringify(fcmBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${FIREBASE_FCM_SERVER_KEY}`,
        },
      });

      this.logger.log(`[deviceId][Response]>>>`, response.data);

      if (
        response.data.failure == 1 &&
        (response.data.results[0]?.error == 'NotRegistered' ||
          response.data.results[0]?.error == 'InvalidRegistration')
      ) {
        // await setInactiveDevicesByUserId(device?.userId.id, device.deviceToken);
      }

      return response.data;
    } catch (error) {
      // if (error.response) {
      //   this.logger.error(
      //     `[deviceId]Error pushNotification: `,
      //     error?.response?.data,
      //   );
      // }
      throw new Error(error?.response?.data || 'Error');
    }
  };

  createGroup = async (
    notification_key_name: string,
    registration_ids: string[],
  ) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://fcm.googleapis.com/fcm/notification',
        data: JSON.stringify({
          operation: 'create', // Use 'create' to create a new group
          notification_key_name,
          registration_ids,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FIREBASE_FCM_SERVER_KEY}`,
          project_id: process.env.FIREBASE_FCM_SENDER_ID,
        },
      });
      return response.data;
    } catch (error) {
      // this.logger.error(`Error pushNotification: `, error?.response?.data);
      throw new Error(error?.response?.data || 'Error');
    }
  };

  subscribeTopic = async (deviceToken: string, topic: string) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `https://iid.googleapis.com/iid/v1/${deviceToken}/rel/topics/${topic}`,
        data: JSON.stringify({}),
        headers: {
          Authorization: `key=${process.env.FIREBASE_FCM_SERVER_KEY}`,
        },
      });
      return response.data;
    } catch (error) {
      // this.logger.error(`Error pushNotification: `, error?.response?.data);
      throw new Error(error?.response?.data || 'Error');
    }
  };

  unsubscribeTopic = async (deviceTokens: string, topic: string) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `https://iid.googleapis.com/iid/v1:batchRemove`,
        data: JSON.stringify({
          to: `/topics/${topic}`,
          registration_tokens: deviceTokens,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FIREBASE_FCM_SERVER_KEY}`,
        },
      });
      return response.data;
    } catch (error) {
      // this.logger.error(`Error pushNotification: `, error?.response?.data);
      throw new Error(error?.response?.data || 'Error');
    }
  };

  publishTopic = async (
    topic: string,
    type: PushNotificationEnum,
    payload: IPayloadPushNotification,
  ) => {
    try {
      const notificationPayload = {
        sound: 'default',
        type,
        title: payload.title,
        body: payload.body,
        badge: payload.badge,
        priority: 'high',
      };
      const fcmBody = {
        topic, // Specify the topic to which you want to publish
        notification: notificationPayload,
        data: payload.data,
      };
      const response = await axios({
        method: 'POST',
        url: process.env.FIREBASE_FCM_URI,
        data: JSON.stringify(fcmBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FIREBASE_FCM_SERVER_KEY}`,
        },
      });
      return response.data;
    } catch (error) {
      // this.logger.error(`Error pushNotification: `, error?.response?.data);
      throw new Error(error?.response?.data || 'Error');
    }
  };
}
