import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { UserAccount } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';
import { Flower } from '../../models/flower.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { OrderByAccountResponse } from '../../models/order.model';
import { AppConfigurationService } from '../../services/configuration.service';
import { StatusService } from '../../services/status.service';
import { SideBarMenu } from '../../models/base.model';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { NotificationType, Role } from '../../models/enums';

@Component({
  selector: 'app-seller-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule,
    MatBadgeModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    TranslateModule,
    MatBadgeModule,
  ],
  templateUrl: './seller-admin.component.html',
  styleUrls: [
    './seller-admin.component.scss',
    './../../../assets/styles/style.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SellerAdminComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  account: UserAccount | null = null;
  listLanguage: any = null; // Danh sách ngôn ngữ lấy từ config
  defaultLang: any = null; // Ngôn ngữ được chọn
  notifications: Notification[] = []; // Danh sách thông báo
  notificationSubscription!: Subscription;
  newNotificationNumber: number = 0; // Số thông báo mới
  notificationType = NotificationType; // Enum loại thông báo
  size: number = 5; // Số lượng thông báo hiển thị
  cursor: string = ''; // Con trỏ phân trang
  roles = Role; // Enum quyền

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private appConfig: AppConfigurationService,
    private statusService: StatusService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.account = this.authService.currentUser;
    if (this.authService.isLoggedIn) {
      this.getFlowersByUserId(this.account?.id!);
      this.getOrdersBySeller();

      // Khởi tạo WebSocket và kết nối
      this.notificationService.connectWebSocket(this.account?.id!);

      // Lấy tất cả thông báo
      this.notificationService.notificationDataSource.subscribe({
        next: (notifications: Notification[]) => {
          this.notifications = notifications;
          this.getNewNotifications();
        },
      });

      // Đăng ký nhận thông báo mới từ WebSocket
      this.notificationSubscription = this.notificationService
        .onNotification()
        .subscribe((notification: Notification) => {
          this.notifications.push(notification);
        });
    }

    this.listLanguage = this.appConfig['Config_Language'].filter(
      (lang: any) => lang.isActive === 1
    );
    this.statusService.statusLanguage$.subscribe((lang) => {
      this.defaultLang = lang ? lang : this.listLanguage[0];
    });
  }

  ngOnDestroy(): void {
    // Ngắt kết nối WebSocket và hủy đăng ký các thông báo
    this.notificationService.disconnectWebSocket();
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  btnLogOut() {
    this.authService.logout();
    this.cartService.reset();
    this.productService.reset();
    this.notificationService.reset();
    this.router.navigate(['/signin']);
  }

  // Lấy danh sách hoa và lưu vào BehaviorSubject
  getFlowersByUserId(userId: number): void {
    this.productService.getFlowersByUserId(userId).subscribe({
      next: (response: Flower[]) => {
        this.productService.flowerByUserDataSource.next(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // Lấy danh sách đơn hàng theo người bán
  getOrdersBySeller() {
    this.orderService
      .getOrdersBySeller('', 'desc', 'createdAt', 0, 10, '', '', '')
      .subscribe({
        next: (response: OrderByAccountResponse) => {
          if (response.success) {
            this.orderService.orderBySellerDataSource.next(response);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }
  // Thay đổi ngôn ngữ
  btnChangeLang(lang: any) {
    this.appConfig.setLanguageDefault(lang.id);
    this.statusService.statusLanguageSource.next(lang);
  }

  // Lấy số thông báo mới
  getNewNotifications() {
    this.newNotificationNumber = this.notifications.filter(
      (notification) => !notification.isRead && !notification.isDeleted
    ).length;
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    // Kiểm tra xem người dùng đã cuộn đến đáy chưa
    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      console.log('Đã cuộn đến đáy!');
      this.loadMoreNotifications(); // Gọi hàm để tải thêm thông báo
    }
  }

  loadMoreNotifications() {
    this.cursor = this.notifications[this.notifications.length - 1]?.createdAt; // Lấy giá trị createdAt của thông báo cuối cùng
    // Lấy tất cả thông báo
    this.notificationService
      .getAllNotifications(this.account?.id!, this.size, this.cursor)
      .subscribe({
        next: (response: Notification[]) => {
          // Nếu không có thông báo mới, không cập nhật cursor
          if (response.length) {
            const olderNotifications = response.filter(
              (notification) => !notification.isRead && !notification.isDeleted
            );
            this.notifications.push(...olderNotifications);
            this.cursor =
              this.notifications[this.notifications.length - 1]?.createdAt ||
              ''; // Cập nhật cursor
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  btnMarkAllAsRead() {
    this.notificationService.markAsReadAll(this.account?.id!).subscribe({
      next: () => {
        this.notifications.forEach(
          (notification) => (notification.isRead = true)
        );
        this.newNotificationNumber = 0;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  routerLinkActive = 'activelink';
  sellerChannelMenu: SideBarMenu[] = [
    {
      link: '/seller-channel',
      icon: 'storefront',
      menu: 'Statistical',
    },
    {
      link: '/seller-channel/product-management',
      icon: 'inventory',
      menu: 'ProductManagement',
    },
    {
      link: '/seller-channel/order-management',
      icon: 'receipt_long',
      menu: 'OrderManagement',
    },
  ];

  adminMenu: SideBarMenu[] = [
    {
      link: '/admin',
      icon: 'dashboard',
      menu: 'Trang chủ quản trị',
    },
    {
      link: '/admin/product-management',
      icon: 'inventory',
      menu: 'Quản lý sản phẩm',
    },
    {
      link: '/admin/category-management',
      icon: 'list',
      menu: 'Quản lý danh mục',
    },
    {
      link: '/admin/user-management',
      icon: 'person',
      menu: 'Quản lý người dùng',
    },
  ];
}
