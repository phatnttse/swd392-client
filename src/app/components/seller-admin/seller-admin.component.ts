import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { map, Observable, shareReplay } from 'rxjs';
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
  ],
  templateUrl: './seller-admin.component.html',
  styleUrls: [
    './seller-admin.component.scss',
    './../../../assets/styles/style.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SellerAdminComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  userAccount: UserAccount | null = null;
  listLanguage: any = null; // Danh sách ngôn ngữ lấy từ config
  defaultLang: any = null; // Ngôn ngữ được chọn

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private appConfig: AppConfigurationService,
    private statusService: StatusService
  ) {}

  ngOnInit(): void {
    this.userAccount = this.authService.currentUser;
    if (this.authService.isLoggedIn) {
      this.getFlowersByUserId(this.userAccount?.id!);
      this.getOrdersBySeller();
    }
    this.listLanguage = this.appConfig['Config_Language'].filter(
      (lang: any) => lang.isActive === 1
    );
    this.statusService.statusLanguage$.subscribe((lang) => {
      this.defaultLang = lang ? lang : this.listLanguage[0];
    });
  }

  btnLogOut() {
    this.authService.logout();
    this.authService.userDataSource.next(null);
    this.cartService.cartDataSource.next([]);
    this.cartService.totalAmountSubject.next(0);
    this.cartService.totalQuantitySubject.next(0);
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

  routerLinkActive = 'activelink';
  sellerChannelMenu: SideBarMenu[] = [
    {
      link: '/seller-channel',
      icon: 'storefront',
      menu: 'Dashboard',
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
      menu: 'Dashboard',
    },
    {
      link: '/admin/product-management',
      icon: 'inventory',
      menu: 'Quản lý kho hàng',
    },
    {
      link: '/admin/category-management',
      icon: 'list',
      menu: 'Quản lý danh mục',
    },
  ];
}
