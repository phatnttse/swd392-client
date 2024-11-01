import {
  routes
} from './../../../../app.routes';
import {
  MatCardModule
} from '@angular/material/card';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatFormFieldModule,
  MatLabel
} from '@angular/material/form-field';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {
  MatTabsModule
} from '@angular/material/tabs';
import {
  CommonModule
} from '@angular/common';
import {
  MatSort
} from '@angular/material/sort';
import {
  Flower,
  FlowerPaginated
} from '../../../../models/flower.model';
import {
  LocalStoreManager
} from '../../../../services/local-storage.service';
import {
  ProductService
} from '../../../../services/product.service';
import {
  DBkeys
} from '../../../../services/db-keys';
import {
  HttpErrorResponse
} from '@angular/common/http';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';
import {
  ToastrService
} from 'ngx-toastr';
import {
  CategoryService
} from '../../../../services/category.service';
import {
  FlowerListingStatus
} from '../../../../models/enums';

@Component({
  selector: 'app-admin-product-management',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    CommonModule,
    RouterModule,
    MatLabel
  ],
  templateUrl: './admin-product-management.component.html',
  styleUrl: './admin-product-management.component.scss',
})
export class AdminProductManagementComponent implements OnInit, AfterViewInit {
  // Biến từ AdminProductManagementComponent
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource < Flower > = new MatTableDataSource < Flower > ();
  listFlower ?: Flower[] = []; // Danh sách hoa
  flower ?: Flower;
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
  isRejectFormVisible: boolean = false;
  displayedColumns: string[] = [
    'image',
    'name',
    'price',
    'stockBalance',
    'action',
  ];

  // Biến từ AdminProductDetailManagementComponent
  productForm!: FormGroup;
  rejectForm!: FormGroup;
  selectedCategoryId: number = 0;
  selectedSubCategoryId: number = 0;
  selectedCategoryName: string | null = null;
  selectedSubCategoryName: string | null = null;
  uploadedImage: string = ''; // Hình ảnh đã tải lên
  uploadedImages: string[] = []; // Danh sách các hình ảnh đã tải lên
  isDisabled: boolean = false; // Trạng thái của nút
  isCategoryError: boolean = false; // Có lỗi liên quan đến danh mục không
  isPictureError: boolean = false; // Có lỗi liên quan đến hình ảnh không
  reason = '';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private localStorage: LocalStoreManager
  ) {
    this.productForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(5)]],
        description: ['', [Validators.required, Validators.min(1000)]],
        price: ['', [Validators.required, Validators.minLength(100)]],
        stockBalance: ['', [Validators.required, Validators.min(1)]],
        discount: ['', [Validators.min(0)]],
      }),
      this.rejectForm = this.formBuilder.group({
        reason: ['', [Validators.required, Validators.minLength(100)]]
      });
  }

  ngOnInit(): void {
    this.getFlowers(
      this.searchString,
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.categoryIds
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
          this.listFlower = response.content.filter(flower => flower.status === FlowerListingStatus.PENDING);
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
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

  //Chuyển hướng sang admin-product-detail với id
  btnChangeStatusPage(status: number, flower? : Flower) {
    this.currentPage = status;
    if (flower) {
      this.flower = flower;
    }
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
  }

  toggleRejectForm() {
    this.isRejectFormVisible = !this.isRejectFormVisible;
  }

  btnApproveFlower(id: number | undefined) {
    if (this.flower !== undefined) {
      this.productService.approveFlowerListing(id).subscribe({
        next: (response: Flower) => {
          this.flower = response;
          this.listFlower = this.listFlower?.filter(flower => flower.id !== id);
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
          if (this.listFlower !== undefined) {
            this.productService.flowerByUserDataSource.next(this.listFlower);
          }
          this.toastr.success(`Duyệt thành công đơn hàng ${response.name} của người dùng ${response.user.name}`);
        },
        error: (error) => {
          this.toastr.error(`Duyệt hoa không thành công`, `ERROR`);
        }
      });
    } else {
      this.toastr.warning('Hoa không xác định hoặc đã được duyệt rồi');
    }
  }

  btnDeniedFlower(id: number | undefined, reason: string) {
    if (this.flower !== undefined) {
      this.productService.rejectFlowerListing(id, reason).subscribe({
        next: (response: Flower) => {
          this.flower = response;
          this.listFlower = this.listFlower?.filter(flower => flower.id !== id);
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
          if (this.listFlower !== undefined) {
            this.productService.flowerByUserDataSource.next(this.listFlower);
          }
          this.toastr.success(`Duyệt thành công đơn hàng ${response.name} của người dùng ${response.user.name}`);
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(`Duyệt hoa không thành công`, `ERROR`);
          console.log(error);
        }
      });
    } else {
      this.toastr.warning('Hoa không xác định hoặc đã được duyệt rồi');
    }
  }
}
