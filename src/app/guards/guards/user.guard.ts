import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // CanActivate: Bảo vệ các route chính
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn) {
      return true;
    } else {
      this.authService.loginRedirectUrl = state.url;
      this.router.navigate(['/signin']);
      this.toastr.info('Đăng nhập để tiếp tục', 'Thông báo');
      return false;
    }
  }

  // CanActivateChild: Bảo vệ các route con
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn) {
      return true;
    } else {
      this.authService.loginRedirectUrl = state.url;
      this.router.navigate(['/signin']);
      this.toastr.info('Đăng nhập để tiếp tục', 'Thông báo');
      return false;
    }
  }
}
