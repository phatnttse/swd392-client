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
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Flower } from '../../models/flower.model';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../../services/order.service';
import { OrderByAccountResponse } from '../../models/order.model';

interface sidebarMenu {
  link: string;
  icon: string;
  menu: string;
}

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
  ],
  templateUrl: './seller-admin.component.html',
  styleUrls: [
    './seller-admin.component.scss',
    './../../../assets/styles/style.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SellerAdminComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  userAccount: UserAccount | null = null;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.userAccount = this.authService.currentUser;
    if (this.authService.isLoggedIn) {
      this.getFlowersByUserId(this.userAccount?.id!);
      this.getOrdersBySeller();
    }
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
      .getOrdersBySeller('', 'desc', 'createdAt', 0, 8, '', '', '')
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

  routerLinkActive = 'activelink';
  sellerChannelMenu: sidebarMenu[] = [
    {
      link: '/seller-channel',
      icon: 'storefront',
      menu: 'Dashboard',
    },
    {
      link: '/seller-channel/product-management',
      icon: 'inventory',
      menu: 'Quản lý sản phẩm',
    },
    {
      link: '/seller-channel/order-management',
      icon: 'receipt_long',
      menu: 'Quản lý đơn hàng',
    },
  ];

  adminMenu: sidebarMenu[] = [
    {
      link: '/admin',
      icon: 'dashboard',
      menu: 'Dashboard',
    },
    {
      link: '/admin/product-management',
      icon: 'inventory',
      menu: 'Kho hàng',
    },
  ];
}
