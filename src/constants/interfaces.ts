export interface IPayloadPushNotification {
  title: string;
  subtitle?: string;
  body?: any;
  badge?: number;
  data?: any;
  extraData?: any;
  toUserId?: string[];
  createdBy?: string;
  updatedBy?: string;
}
