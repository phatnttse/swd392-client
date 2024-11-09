import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import { AppConfigurationService } from './configuration.service';
import { BroadCast, BroadCastResponse, Notification } from '../models/notification.model';
import { AuthService } from './auth.service';
import { EndpointBase } from './endpoint-base.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends EndpointBase{
  private NOTIFICATION_URL: string;
  private WEBSOCKET_URL: string;
  private client!: Client;
  private notificationSubject = new Subject<Notification>();

  // Trạng thái của thông báo
  public notificationDataSource = new BehaviorSubject<Notification[]>([]);
  notification$ = this.notificationDataSource.asObservable();

  constructor(
    http: HttpClient,
    private appConfig: AppConfigurationService,
    authService: AuthService,
  ) {
    super(http, authService);
    this.NOTIFICATION_URL = appConfig['NOTIFICATION_URL'];
    this.WEBSOCKET_URL = appConfig['WEBSOCKET_URL'];
  }

  reset() {
    this.disconnectWebSocket();
    this.notificationSubject = new Subject<Notification>();
    this.notificationDataSource = new BehaviorSubject<Notification[]>([]);
  }

  // Thiết lập STOMP để kết nối và nhận thông báo
  connectWebSocket(userId: number): void {
    this.client = new Client({
      brokerURL: `${this.WEBSOCKET_URL}/ws`, // Đường dẫn WebSocket của server
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to STOMP');

        // Đăng ký lắng nghe các thông báo từ STOMP
        this.client.subscribe(
          `${this.NOTIFICATION_URL}/ws`,
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
  getAllNotifications(
    userId: number,
    size: number,
    cursor: string
  ): Observable<Notification[]> {
    const params = new HttpParams()
      .set('size', size.toString())
      .set('cursor', cursor);

    return this.http.get<Notification[]>(
      `${this.NOTIFICATION_URL}/notifications/users/${userId}`,
      { params }
    );
  }

  getAllBroadcast(): Observable<BroadCastResponse>{
    return this.http.get<BroadCastResponse>(
      `${this.NOTIFICATION_URL}/broadcast-notifications`,
      this.requestHeaders
    );
  }

  addNewNotification(title: string, message: string, type: string, destinationScreen: string, scheduledTime: string): Observable<Notification>{
      return this.http.post<Notification>(
        `${this.NOTIFICATION_URL}/broadcast-notifications`,
        {title, message, type, destinationScreen, scheduledTime},
      this.requestHeaders).pipe(
        catchError((error) => {
          return this.handleError(error, () => this.addNewNotification(title, message, type, destinationScreen, scheduledTime));
        })
      );
  }

  markAsReadAll(userId: number): Observable<any> {
    return this.http.post(
      `${this.NOTIFICATION_URL}/notifications/users/${userId}/read-all`,
      {}
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
