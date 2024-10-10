import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StatusService } from './services/status.service';
import { CartService } from './services/cart.service';
import { GetCartByUserResponse } from './models/cart.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from './services/category.service';
import { FlowerCategory } from './models/category.model';

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
    private statusService: StatusService,
    private cartService: CartService,
    private categoryService: CategoryService
  ) {}
  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn;

    if (this.isUserLoggedIn) {
      this.authService.userDataSource.next(this.authService.currentUser);
      if (this.cartService.cartDataSource.value.length === 0) {
        this.getCartByUser();
      }
    }

    if (this.categoryService.categoryDataSource.value.length === 0) {
      this.getAllCategories();
    }

    this.statusService.statusLoadingSpinner$.subscribe((status) => {
      this.isLoading = status;
    });
  }

  // Lấy giỏ hàng ban đầu và phân phối dữ liệu
  getCartByUser() {
    this.cartService.getCartByUser().subscribe({
      next: (response: GetCartByUserResponse) => {
        if (response.code === 200 && response.data) {
          this.cartService.cartDataSource.next(response.data);
          this.cartService.updateTotalQuantity(response.data);
          this.cartService.updateTotalAmount(response.data);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // Lấy tất cả danh mục ban đầu và phân phối dữ liệu
  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response: FlowerCategory[]) => {
        this.categoryService.categoryDataSource.next(response);
        const convertedCategories = this.convertCategories(response);
        this.categoryService.convertedCategoryDataSource.next(
          convertedCategories
        );
        console.log('Converted Categories:', convertedCategories);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // Hàm chuyển đổi danh mục
  convertCategories(categories: FlowerCategory[]): any[] {
    const categoryMap: { [key: string]: any } = {};

    // Bản đồ ánh xạ tên danh mục cha từ tiếng Anh sang tiếng Việt
    const categoryTranslations: { [key: string]: string } = {
      TYPE: 'Theo loại',
      COLOR: 'Theo màu sắc',
      EVENT_TYPE: 'Theo loại sự kiện',
      SUBJECT: 'Theo đối tượng',
      DISPLAY: 'Theo cách trình bày',
    };

    // Tạo bản đồ các danh mục
    categories.forEach((category) => {
      // Tạo danh mục cha nếu chưa tồn tại
      if (!categoryMap[category.id]) {
        categoryMap[category.id] = {
          id: category.id,
          name: category.name || 'Unnamed Category', // Gán tên mặc định nếu không có tên
          children: [],
        };
      }

      // Nếu danh mục có danh mục cha, thêm vào danh mục cha
      if (category.categoryParent) {
        // Tạo danh mục cha nếu chưa tồn tại
        if (!categoryMap[category.categoryParent]) {
          categoryMap[category.categoryParent] = {
            id: category.categoryParent,
            name:
              categoryTranslations[category.categoryParent] ||
              'Unnamed Category', // Gán tên tiếng Việt nếu có
            children: [],
          };
        }
        // Thêm danh mục hiện tại vào danh sách con của danh mục cha
        categoryMap[category.categoryParent].children.push({
          id: category.id,
          name: category.name || 'Unnamed Category', // Gán tên mặc định nếu không có tên
        });
      }
    });

    // Chuyển đổi bản đồ thành mảng và chỉ lấy các danh mục cha
    return Object.values(categoryMap).filter(
      (cat) => !categories.some((c) => c.id === cat.id && c.categoryParent)
    );
  }
}
