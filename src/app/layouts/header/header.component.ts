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
import { ProductService } from '../../services/product.service';
import { StatusService } from '../../services/status.service';

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
  convertedCategories: ConvertedCategory[] = []; // Danh sách danh mục đã chuyển đổi
  searchValue: string = ''; // Giá trị tìm kiếm

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private appConfig: AppConfigurationService,
    private router: Router,
    private productService: ProductService,
    public statusService: StatusService
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
        }
      }
    );
    this.listLanguage = this.appConfig['Config_Language'].filter(
      (lang: any) => lang.isActive === 1
    );
    this.statusService.statusLanguage$.subscribe((lang) => {
      this.defaultLang = lang ? lang : this.listLanguage[0];
    });
  }

  // Chuyển đến trang sản phẩm theo danh mục
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
    this.statusService.statusLanguageSource.next(lang);
  }

  // Đăng xuất
  btnLogOut() {
    this.authService.logout();
    this.cartService.reset();
    this.productService.reset();
    this.router.navigate(['/signin']);
  }
}
