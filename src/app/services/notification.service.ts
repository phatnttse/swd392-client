import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import { AppConfigurationService } from './configuration.service';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private NOTIFICATION_URL: string;
  private client!: Client;
  private notificationSubject = new Subject<Notification>();

  constructor(
    private appConfig: AppConfigurationService,
    private http: HttpClient
  ) {
    this.NOTIFICATION_URL = appConfig['NOTIFICATION_URL'];
  }

  // Thiết lập STOMP để kết nối và nhận thông báo
  connectWebSocket(userId: number): void {
    this.client = new Client({
      brokerURL: `${this.NOTIFICATION_URL}/ws`, // Đường dẫn WebSocket của server
      onConnect: () => {
        console.log('Connected to STOMP');

        // Đăng ký lắng nghe các thông báo từ STOMP
        this.client.subscribe(
          `/notifications/users/${userId}`,
          (response: Notification) => {
            this.notificationSubject.next(response);
          }
        );
      },
      onStompError: (frame: any) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    // Khởi động kết nối
    this.client.activate();
  }

  // Lấy tất cả thông báo qua API cho lần tải đầu tiên
  getAllNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.NOTIFICATION_URL}/notifications/users/6`
    );
  }

  // Observable để các component đăng ký nhận thông báo mới
  onNotification(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  // Đóng kết nối WebSocket khi không còn sử dụng nữa
  disconnectWebSocket(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
