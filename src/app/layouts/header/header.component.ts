import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { AppConfigurationService } from '../../services/configuration.service';
import { UserAccount } from '../../models/account.model';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../services/category.service';
import { ConvertedCategory, FlowerCategory } from '../../models/category.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Utilities } from '../../services/utilities';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    TranslateModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  account?: UserAccount | null; // Thông tin người dùng
  listLanguage: any = null; // Danh sách ngôn ngữ lấy từ config
  defaultLang: any = null; // Ngôn ngữ được chọn
  listCartItem: CartItem[] = []; // Danh sách sản phẩm trong giỏ hàng
  totalCartItem: number = 0; // Tổng số lượng sản phẩm trong giỏ hàng
  totalAmount: number = 0; // Tổng tiền trong giỏ hàng
  listCategory: FlowerCategory[] = []; // Danh sách danh mục
  convertedCategories: any[] = []; // Danh sách danh mục đã chuyển đổi
  searchValue: string = ''; // Giá trị tìm kiếm

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private appConfig: AppConfigurationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Đăng ký lấy thông tin người dùng
    this.authService.userData$.subscribe(
      (userData: UserAccount) => (this.account = userData)
    );

    // Đăng ký lấy thông tin giỏ hàng
    this.cartService.cartData$.subscribe(
      (cartData: CartItem[]) => (this.listCartItem = cartData)
    );

    // Đăng ký lấy tổng số lượng sản phẩm trong giỏ hàng
    this.cartService.totalQuantity$.subscribe(
      (totalQuantity: number) => (this.totalCartItem = totalQuantity)
    );

    // Đăng ký lấy tổng tiền trong giỏ hàng
    this.cartService.totalAmount$.subscribe(
      (totalAmount: number) => (this.totalAmount = totalAmount)
    );

    // Đăng ký lấy danh sách danh mục
    this.categoryService.convertedCategoryDataSource.subscribe(
      (categoryData: ConvertedCategory[]) => {
        if (categoryData) {
          this.convertedCategories = categoryData;
          console.log(this.convertedCategories);
        }
      }
    );
    this.listLanguage = this.appConfig['Config_Language'];
    this.defaultLang = this.listLanguage[0];
  }

  // Chuyển đến trang chi tiết sản phẩm
  goToProductListPageByCategory(categoryId: number) {
    this.router.navigate(['/products'], {
      queryParams: { c: categoryId },
    });
  }

  // Tìm kiếm sản phẩm
  btnSearch(event: Event, searchString: string) {
    event.preventDefault();
    const searchQuery = searchString.trim();
    this.router.navigate(['/products'], {
      queryParams: { query: searchQuery },
    });
    this.searchValue = '';
  }

  // Thay đổi ngôn ngữ
  btnChangeLang(lang: any) {
    this.appConfig.setLanguageDefault(lang.id);
    this.defaultLang = lang;
  }

  // Đăng xuất
  btnLogOut() {
    this.authService.logout();
    this.authService.userDataSource.next(null);
    this.router.navigate(['/signin']);
  }
}
