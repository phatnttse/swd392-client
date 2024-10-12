import { MatCardModule } from '@angular/material/card';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { Flower } from '../../../../models/flower.model';
import { LocalStoreManager } from '../../../../services/local-storage.service';
import { ProductService } from '../../../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { CategoryService } from '../../../../services/category.service';
import {
  ConvertedCategory,
  SubCategory,
} from '../../../../models/category.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-seller-product-management',
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
    MatMenuModule,
  ],
  templateUrl: './seller-product-management.component.html',
  styleUrl: './seller-product-management.component.scss',
})
export class SellerProductManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<Flower> = new MatTableDataSource<Flower>(); // Dữ liệu bảng
  listFlower: Flower[] = []; // Danh sách hoa
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
  statusPage: number = 0; // trạng thái của trang 0: all, 1: create or update
  displayedColumns: string[] = [
    // Các cột hiển thị
    'image',
    'name',
    'category',
    'price',
    'stockBalance',
    'action',
  ];

  // Tạo sản phẩm mới
  createProductForm: FormGroup; // Form tạo sản phẩm
  uploadedImage: string = ''; // Ảnh đã tải lên
  fileImage: File | null = null; // File ảnh
  isPictureError: boolean = false; // Lỗi không tải ảnh
  selectedCategories: SubCategory[] = []; // Danh sách  danh mục đã chọn
  isCategoryError: boolean = false; // Lỗi không chọn danh mục
  categories: ConvertedCategory[] = []; // Danh sách danh mục
  selectedCurrentCategory: ConvertedCategory | null = null; // Danh mục được chọn hiện tại

  constructor(
    private localStorage: LocalStoreManager,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.createProductForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(1000)]],
      description: ['', [Validators.required, Validators.minLength(100)]],
      stockBalance: ['', [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.productService.flowerByUserDataSOurce.subscribe({
      next: (flowerData: Flower[] | null) => {
        if (flowerData != null) {
          this.listFlower = flowerData;
        } else {
          this.getFlowersByUserId(this.authService.currentUser?.id!);
        }
      },
    });

    this.categoryService.convertedCategoryData$.subscribe(
      (categoryData: ConvertedCategory[]) => {
        this.categories = categoryData;
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // Tìm kiếm sản phẩm theo angular material table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Lấy danh sách hoa và lưu vào BehaviorSubject
  getFlowersByUserId(userId: number): void {
    this.productService.getFlowersByUserId(userId).subscribe({
      next: (response: Flower[]) => {
        this.listFlower = response;
        this.productService.flowerByUserDataSOurce.next(response);
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error);
        console.error(error);
      },
    });
  }

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
  }

  // Tạo sản phẩm mới hoặc cập nhật --------------------------- statusPage = 1

  // Tạo sản phẩm mới
  btnCreateNewProduct() {
    if (
      this.createProductForm.invalid ||
      !this.uploadedImage ||
      !this.selectedCategories.length
    ) {
      this.isPictureError = !this.uploadedImage;
      this.isCategoryError = !this.selectedCategories.length;
      this.createProductForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.createProductForm.get('name')!.value);
    formData.append(
      'description',
      this.createProductForm.get('description')!.value
    );
    formData.append('price', this.createProductForm.get('price')!.value);
    formData.append(
      'stockBalance',
      this.createProductForm.get('stockBalance')!.value
    );
    formData.append('address', this.createProductForm.get('address')!.value);

    this.selectedCategories.forEach((category) => {
      formData.append('categories', category.id.toString());
    });

    if (this.fileImage) {
      formData.append('image', this.fileImage);
    }

    this.productService.createFlower(formData).subscribe({
      next: (response) => {
        console.log('Product created successfully', response);
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.error, 'Error');
        console.error('Error creating product: ', error);
      },
    });
  }

  setCurrentSelectedCategory(category: ConvertedCategory) {
    this.selectedCurrentCategory = category;
  }

  btnSelectCategory(category: SubCategory) {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(
        (item) => item !== category
      );
    } else {
      this.selectedCategories.push(category);
      this.isCategoryError = false;
    }
  }

  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.fileImage = fileInput.files[0];
      this.uploadedImage = URL.createObjectURL(this.fileImage);
      this.isPictureError = false;
    } else {
      this.uploadedImage = '';
    }
  }
}
