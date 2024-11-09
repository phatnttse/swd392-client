export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  destinationScreen: string;
  isRead: boolean;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
