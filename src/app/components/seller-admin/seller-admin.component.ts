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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userAccount = this.authService.currentUser;
  }

  btnLogOut() {
    this.authService.logout();
    this.authService.userDataSource.next(null);
    this.router.navigate(['/signin']);
  }

  routerLinkActive = 'activelink';
  sellerChannelMenu: sidebarMenu[] = [
    {
      link: '/seller-channel',
      icon: 'bar_chart',
      menu: 'Dashboard',
    },
    {
      link: '/seller-channel/product-management',
      icon: 'inventory',
      menu: 'Quản lý sản phẩm',
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
