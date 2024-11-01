import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { Flower, FlowerPaginated } from '../../models/flower.model';
import { ProductService } from '../../services/product.service';
import { MatMenuModule } from '@angular/material/menu';
import { CategoryService } from '../../services/category.service';
import { InsertUpdateCartResponse } from '../../models/cart.model';
import { Utilities } from '../../services/utilities';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { ConvertedCategory } from '../../models/category.model';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule,
    MatPaginatorModule,
    MatMenuModule,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
    TruncatePipe,
    BreadcrumbComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  listFlower?: Flower[] = []; // Danh sách hoa
  searchString: string = ''; // Chuỗi tìm kiếm
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 16; // Số lượng sản phẩm trên mỗi trang
  categoryIds: number[] = []; // Danh sách id danh mục
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  convertedCategories: any[] = []; // Danh sách danh mục đã convert
  debounceTimer: any; // Timer debounce
  titleSearch: string = 'Products.All'; // Tiêu đề tìm kiếm
  titleTypeArrange: string = 'Products.Default'; // Tiêu đề sắp xếp

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    // Theo dõi sự thay đổi của queryParams
    this.route.queryParams.subscribe((params) => {
      if (params['c']) {
        this.categoryIds = [params['c']];
        this.getFlowers(
          this.searchString,
          this.order,
          this.sortBy,
          this.pageNumber,
          this.pageSize,
          this.categoryIds
        );
      } else if (params['query']) {
        Utilities.closeOffCanvas('offcanvasSearch');
        this.searchString = params['query'];
        this.getFlowers(
          this.searchString,
          this.order,
          this.sortBy,
          this.pageNumber,
          this.pageSize,
          this.categoryIds
        );
        this.titleSearch = `Products.ResultByKeyword`;
      } else {
        this.titleSearch = 'Products.All';
        this.searchString = '';
        this.categoryIds = [];
      }
    });
    this.productService.flowerPaginatedDataSource.subscribe({
      next: (flowerData: FlowerPaginated | null) => {
        // Chỉ thực thi logic này nếu không có dữ liệu search
        if (flowerData != null && !this.searchString) {
          this.listFlower = flowerData.content;
          this.pageNumber = flowerData.pageNumber;
          this.pageSize = flowerData.pageSize;
          this.totalPages = flowerData.totalPages;
          this.totalElements = flowerData.totalElements;
          this.visiblePages = Utilities.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        } else if (!this.searchString) {
          this.getAllFlowers();
        }
      },
    });
    this.categoryService.convertedCategoryDataSource.subscribe(
      (categoryData: ConvertedCategory[]) => {
        if (categoryData) {
          this.convertedCategories = categoryData;
        }
      }
    );
  }

  // Lấy danh sách hoa theo điều kiện
  getFlowers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    categoryIds: number[]
  ) {
    this.productService
      .getFlowers(
        searchString,
        order,
        sortBy,
        this.currentPage,
        pageSize,
        categoryIds
      )
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.listFlower = response.content;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.visiblePages = Utilities.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  // Lấy danh sách tất cả hoa
  getAllFlowers() {
    this.productService
      .getFlowers('', 'desc', 'createdAt', 0, 16, [])
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.listFlower = response.content;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.visiblePages = Utilities.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
          this.productService.flowerPaginatedDataSource.next(response); // Lưu vào BehaviorSubject
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  // Xem chi tiết hoa
  viewFlowerDetails(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  // Xử lý khi thay đổi trang
  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.getFlowers(
      this.searchString,
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.categoryIds
    );
    this.visiblePages = Utilities.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }

  // Xử lý khi thay đổi danh mục
  onCategoryChange(categoryId: number, event: any) {
    if (event.checked) {
      this.categoryIds.push(categoryId);
    } else {
      this.categoryIds = this.categoryIds.filter((id) => id !== categoryId);
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.getFlowers(
        this.searchString,
        this.order,
        this.sortBy,
        this.currentPage,
        this.pageSize,
        this.categoryIds
      );
    }, 300);
  }

  // Thêm hoặc cập nhật sản phẩm trong giỏ hàng
  btnInsertUpdateCart(flowerId: number, quantity: number) {
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
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }

  // Xử lý khi thay đổi sắp xếp
  setSortingOption(order: string, sortBy: string, title: string) {
    this.getFlowers(
      this.searchString,
      order,
      sortBy,
      this.pageNumber,
      this.pageSize,
      this.categoryIds
    );
    this.titleTypeArrange = title;
  }
}
