import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StatusService } from './services/status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'swd392-client';
  isUserLoggedIn: boolean = false; // Kiểm tra người dùng đã đăng nhập hay chưa
  isLoading: boolean = false; // Kiểm tra trạng thái loading

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private statusService: StatusService
  ) {}
  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn;

    if (this.isUserLoggedIn) {
      this.toastr.info('Welcome Back');
      this.authService.userDataSource.next(this.authService.currentUser);
    }

    this.statusService.statusLoadingSpinner$.subscribe((status) => {
      this.isLoading = status;
    });
  }
}
