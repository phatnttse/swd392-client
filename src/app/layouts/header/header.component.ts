import { Component, HostListener, OnInit } from '@angular/core';
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
import { FlowerCategory } from '../../models/category.model';
import { Utilities } from '../../services/utilities';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    this.authService.userData$.subscribe(
      (userData: UserAccount) => (this.account = userData)
    );
    this.cartService.cartData$.subscribe(
      (cartData: CartItem[]) => (this.listCartItem = cartData)
    );
    this.cartService.totalQuantity$.subscribe(
      (totalQuantity: number) => (this.totalCartItem = totalQuantity)
    );
    this.cartService.totalAmount$.subscribe(
      (totalAmount: number) => (this.totalAmount = totalAmount)
    );
    this.categoryService.convertedCategoryDataSource.subscribe(
      (categoryData: any[]) => {
        if (categoryData) {
          this.convertedCategories = categoryData;
          console.log(this.convertedCategories);
        }
      }
    );
    this.listLanguage = this.appConfig['Config_Language'];
    this.defaultLang = this.listLanguage[0];
  }

  goToProductListPageByCategory(categoryId: number) {
    this.router.navigate(['/products'], {
      queryParams: { categoryId: categoryId },
    });
  }

  btnSearch(searchString: string) {
    this.router.navigate(['/products'], {
      queryParams: { query: searchString },
    });
    this.searchValue = '';
  }

  btnChangeLang(lang: any) {
    this.appConfig.setLanguageDefault(lang.id);
    this.defaultLang = lang;
  }

  btnLogOut() {
    this.authService.logout();
    this.authService.userDataSource.next(null);
    this.router.navigate(['/signin']);
  }
}
