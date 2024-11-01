export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  destinationScreen: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
