import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushNotificationEnum } from 'src/constants/enums';
import { IPayloadPushNotification } from 'src/constants/interfaces';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(200)
  async sendNotification(
    @Body()
    data: {
      deviceToken: string;
      message: IPayloadPushNotification;
      type: PushNotificationEnum;
    },
  ) {
    const { deviceToken, message, type } = data;
    return this.notificationService.pushNotification(
      deviceToken,
      type,
      message,
    );
  }

  @Post('create-group')
  @HttpCode(200)
  async createGroup(
    @Body()
    data: {
      notification_key_name: string;
      registration_ids: string[];
    },
  ) {
    const { notification_key_name, registration_ids } = data;
    return this.notificationService.createGroup(
      notification_key_name,
      registration_ids,
    );
  }

  @Post('group')
  @HttpCode(200)
  async sendNotificationToGroup(
    @Body()
    data: {
      deviceToken: string;
      message: IPayloadPushNotification;
      type: PushNotificationEnum;
    },
  ) {
    const { deviceToken, message, type } = data;
    return this.notificationService.pushNotification(
      deviceToken,
      type,
      message,
    );
  }

  @Post('subscribe')
  @HttpCode(200)
  async subscribeTopic(
    @Body()
    data: {
      deviceToken: string;
      topic: string;
    },
  ) {
    const { deviceToken, topic } = data;
    return this.notificationService.subscribeTopic(deviceToken, topic);
  }

  @Post('publish')
  @HttpCode(200)
  async publishTopic(
    @Body()
    data: {
      topic: string;
      message: IPayloadPushNotification;
      type: PushNotificationEnum;
    },
  ) {
    const { type, message, topic } = data;
    return this.notificationService.publishTopic(topic, type, message);
  }
}
