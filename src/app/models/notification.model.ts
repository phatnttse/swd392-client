import { BaseResponse } from "./base.model";

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
export interface BroadCast {
  id: number;
  title: string;
  message: string;
  type: string;
  destinationScreen: string;
  isExecuted: boolean;
  scheduledTime: string;
  executeTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadCastResponse{
  content: BroadCast[];
}

