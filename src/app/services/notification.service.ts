import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AppConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private NOTIFICATION_URL: string;
  private wsSubject!: WebSocketSubject<any>;
  private notificationSubject = new Subject<any>();

  constructor(
    private appConfig: AppConfigurationService,
    private http: HttpClient
  ) {
    this.NOTIFICATION_URL = appConfig['NOTIFICATION_URL'];
  }

  // Thiết lập WebSocket để kết nối và nhận thông báo
  connectWebSocket(userId: number): void {
    // Tạo WebSocket với URL dựa trên userId
    this.wsSubject = webSocket(
      `${this.NOTIFICATION_URL}/notifications/users/${userId}`
    );

    // Đăng ký lắng nghe các thông báo từ WebSocket
    this.wsSubject.subscribe({
      next: (notification: any) => {
        this.notificationSubject.next(notification);
      },
      error: (error: any) => {
        console.error('Connect notification service error:', error);
      },
    });
  }

  // Lấy tất cả thông báo qua API cho lần tải đầu tiên
  getAllNotifications(userId: number): Observable<any> {
    return this.http.get(
      `${this.NOTIFICATION_URL}/notifications/users/${userId}`
    );
  }

  // Observable để các component đăng ký nhận thông báo mới
  onNotification(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  // Đóng kết nối WebSocket khi không còn sử dụng nữa
  disconnectWebSocket(): void {
    if (this.wsSubject) {
      this.wsSubject.complete();
    }
  }
}
