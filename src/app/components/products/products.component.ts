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
import { LocalStoreManager } from '../../services/local-storage.service';
import { DBkeys } from '../../services/db-keys';
import { InsertUpdateCartResponse } from '../../models/cart.model';
import { Utilities } from '../../services/utilities';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

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
  pageSize: number = 8; // Số lượng sản phẩm trên mỗi trang
  categoryIds: number[] = []; // Danh sách id danh mục
  numberOfElements: number = 0; // Số lượng sản phẩm hiện tại
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  convertedCategories: any[] = []; // Danh sách danh mục đã convert
  debounceTimer: any; // Timer debounce
  titleSearch: string = 'Tất cả sản phẩm'; // Tiêu đề tìm kiếm
  titleTypeArrange: string = 'Mặc định'; // Tiêu đề sắp xếp

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private localStorage: LocalStoreManager,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    // Theo dõi sự thay đổi của queryParams
    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) {
        this.categoryIds = [params['categoryId']];
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
        this.titleSearch = `Kết quả tìm kiếm cho từ khoá`;
      } else {
        this.titleSearch = 'Tất cả sản phẩm';
        this.searchString = '';
        this.categoryIds = [];
      }
    });

    this.getFlowers(
      this.searchString,
      this.order,
      this.sortBy,
      this.pageNumber,
      this.pageSize,
      this.categoryIds
    );
    this.categoryService.convertedCategoryDataSource.subscribe(
      (categoryData: any[]) => {
        if (categoryData) {
          this.convertedCategories = categoryData;
        }
      }
    );
  }

  // Lấy danh sách hoa và lưu vào BehaviorSubject
  getFlowers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    categoryIds: number[]
  ) {
    this.currentPage =
      Number(this.localStorage.getData(DBkeys.CURRENT_PRODUCTS_PAGE)) || 0;
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
          this.numberOfElements = response.numberOfElements;
          this.totalElements = response.totalElements;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  viewFlowerDetails(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.localStorage.savePermanentData(
      String(page),
      DBkeys.CURRENT_PRODUCTS_PAGE
    );
    this.getFlowers(
      this.searchString,
      this.order,
      this.sortBy,
      page,
      this.pageSize,
      this.categoryIds
    );
  }

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
        this.toastr.error(error.error.error);
      },
    });
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages + 1, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

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
