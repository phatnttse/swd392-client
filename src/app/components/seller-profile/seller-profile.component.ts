import { CategoryService } from './../../services/category.service';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { Flower } from '../../models/flower.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Utilities } from '../../services/utilities';
import { InsertUpdateCartResponse } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ConvertedCategory } from '../../models/category.model';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';
import {
  SellerProfile,
  SellerProfileResponse,
} from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    TranslateModule,
    TruncatePipe,
    BreadcrumbComponent,
  ],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.scss',
})
export class SellerProfileComponent {
  listFlower: Flower[] | null = null; // Danh sách hoa
  sellerInfo: SellerProfile | null = null; // Thông tin người bán
  listCategory: ConvertedCategory[] = []; // Danh sách danh mục

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      const userIdString = queryParams['sellerId'];
      if (userIdString) {
        const userId = +userIdString;
        this.getSellerProfile(userId);
        this.getFlowersByUserId(userId);
      }
    });
    this.categoryService.convertedCategoryData$.subscribe(
      (data: ConvertedCategory[]) => {
        this.listCategory = data;
      }
    );
  }

  getFlowersByUserId(userId: number): void {
    this.productService.getFlowersByUserId(userId).subscribe({
      next: (response: Flower[]) => {
        this.listFlower = response;
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error);
      },
    });
  }

  getSellerProfile(userId: number): void {
    this.accountService.getSellerProfile(userId).subscribe({
      next: (response: SellerProfileResponse) => {
        this.sellerInfo = response.data;
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.error);
      },
    });
  }
  // Xem chi tiết hoa
  viewFlowerDetails(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  // Thêm hoặc cập nhật sản phẩm trong giỏ hàng
  btnInsertUpdateCart(flowerId: number, quantity: number) {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/signin']);
      this.toastr.info('Vui lòng đăng nhập', '', { progressBar: true });
      return;
    }
    this.cartService.insertUpdateCart(flowerId, quantity).subscribe({
      next: (response: InsertUpdateCartResponse) => {
        if (response.data && response.success && response.code === 200) {
          this.toastr.success(
            `Bạn vừa thêm ${response.data.flowerName} vào giỏ hàng`,
            'Thành công',
            { progressBar: true, positionClass: 'toast-bottom-right' }
          );
          Utilities.openOffCanvas('offcanvasCart');
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.error);
      },
    });
  }
}
