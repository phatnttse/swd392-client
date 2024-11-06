import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StatusService } from './services/status.service';
import { CartService } from './services/cart.service';
import { GetCartByUserResponse } from './models/cart.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from './services/category.service';
import { ConvertedCategory, FlowerCategory } from './models/category.model';
import { FlowerPaginated } from './models/flower.model';
import { ProductService } from './services/product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from './services/notification.service';
import { Notification } from './models/notification.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Blossom App';
  isLoading: boolean = false; // Kiểm tra trạng thái loading
  searchString: string = ''; // Chuỗi tìm kiếm
  order: string = 'desc'; // Sắp xếp giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo ngày tạo
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Trang hiện tại
  pageSize: number = 16; // Số lượng sản phẩm mỗi trang
  categoryIds: number[] = []; // Danh sách ID danh mục
  size: number = 5; // Số lượng thông báo mỗi lần tải
  cursor: string = ''; // Con trỏ phân trang

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private statusService: StatusService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.authService.userDataSource.next(this.authService.currentUser);
      if (this.cartService.cartDataSource.value.length === 0) {
        this.getCartByUser();
      }
      this.getAllNotifications();
    }

    if (this.categoryService.categoryDataSource.value.length === 0) {
      this.getAllCategories();
    }

    if (this.productService.flowerNewestDataSource.value == null) {
      this.getNewestFlowers();
    }

    this.statusService.statusLoadingSpinner$.subscribe((status) => {
      this.isLoading = status;
    });
  }

  // Lấy danh sách hoa và lưu vào BehaviorSubject
  getNewestFlowers() {
    this.productService
      .getFlowers(
        this.searchString,
        this.order,
        this.sortBy,
        this.pageNumber,
        this.pageSize,
        this.categoryIds
      )
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.productService.flowerNewestDataSource.next(response);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
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
        const convertedCategories: ConvertedCategory[] =
          this.convertCategories(response);
        this.categoryService.convertedCategoryDataSource.next(
          convertedCategories
        );
        this.categoryService.categoryDataSource.next(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // Lấy tất cả thông báo
  getAllNotifications() {
    this.notificationService
      .getAllNotifications(this.authService.currentUser?.id!, 5, '')
      .subscribe({
        next: (response: Notification[]) => {
          if (response.length) {
            const notifications = response.filter(
              (notification) => !notification.isRead && !notification.isDeleted
            );
            this.notificationService.notificationDataSource.next(notifications);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  // Hàm chuyển đổi danh mục
  convertCategories(categories: FlowerCategory[]): ConvertedCategory[] {
    const categoryMap: { [key: string]: any } = {};

    // Bản đồ ánh xạ tên danh mục cha từ tiếng Anh sang tiếng Việt
    const categoryTranslations: { [key: string]: string } = {
      TYPE: 'Theo loại',
      COLOR: 'Theo màu sắc',
      EVENT_TYPE: 'Theo sự kiện',
      SUBJECT: 'Theo đối tượng',
      DISPLAY: 'Theo trình bày',
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
