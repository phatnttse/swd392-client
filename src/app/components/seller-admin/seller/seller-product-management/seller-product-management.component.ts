import { MatCardModule } from '@angular/material/card';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Flower } from '../../../../models/flower.model';
import { ProductService } from '../../../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { CategoryService } from '../../../../services/category.service';
import {
  ConvertedCategory,
  SubCategory,
} from '../../../../models/category.model';
import { ToastrService } from 'ngx-toastr';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, filter, Subscription } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { IntegrationService } from '../../../../services/integration.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  SuggestAddress,
  SuggestAddressResponse,
} from '../../../../models/integration.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { StatusService } from '../../../../services/status.service';

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
    MatOptionModule,
    MatSelectModule,
    MatBadgeModule,
    TranslateModule,
    MatSortModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './seller-product-management.component.html',
  styleUrl: './seller-product-management.component.scss',
})
export class SellerProductManagementComponent
  implements OnInit, AfterViewInit, OnDestroy
{
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
  statusPage: number = 0; // trạng thái của trang 0: all, 1: create , 2: update
  flowerSubscription: Subscription | null = null; // Biến lưu subscription
  displayedColumns: string[] = [
    // Các cột hiển thị
    'image',
    'name',
    'category',
    'price',
    'stockQuantity',
    'status',
    'action',
  ];

  // Tạo sản phẩm mới
  productForm: FormGroup; // Form tạo sản phẩm
  uploadedImages: string[] = []; // Ảnh đã tải lên
  fileImages: File[] = []; // File ảnh
  isPictureError: boolean = false; // Lỗi không tải ảnh
  selectedCategories: SubCategory[] = []; // Danh sách  danh mục đã chọn
  isCategoryError: boolean = false; // Lỗi không chọn danh mục
  categories: ConvertedCategory[] = []; // Danh sách danh mục
  selectedCurrentCategory: ConvertedCategory | null = null; // Danh mục được chọn hiện tại
  selectedProduct: Flower | null = null; // Sản phẩm được chọn
  draggedImage: any; // Ảnh kéo thả
  productDetail: Flower | null = null; // Chi tiết sản phẩm
  suggestAddresses: SuggestAddress[] = []; // Địa chỉ gợi ý

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private integrationService: IntegrationService,
    private statusService: StatusService
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(1000)]],
      description: ['', [Validators.required, Validators.minLength(100)]],
      stockQuantity: ['', [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      expireDate: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.flowerSubscription =
      this.productService.flowerByUserDataSource.subscribe({
        next: (flowerData: Flower[]) => {
          this.listFlower = flowerData;
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
        },
      });

    this.categoryService.convertedCategoryData$.subscribe(
      (categoryData: ConvertedCategory[]) => {
        this.categories = categoryData;
      }
    );

    this.productForm
      .get('address')
      ?.valueChanges.pipe(
        debounceTime(500), // Đợi 500ms sau khi người dùng ngừng gõ
        filter((value) => value && value.length >= 20) // Chỉ tiếp tục nếu độ dài chuỗi >= 20
      )
      .subscribe(() => {
        this.onAddressChange();
      });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.flowerSubscription) {
      this.flowerSubscription.unsubscribe();
    }
  }

  // Tìm kiếm sản phẩm theo angular material table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
    this.productForm.reset();
    this.selectedProduct = null;
    this.selectedCategories = [];
    this.uploadedImages = [];
  }

  // Tạo sản phẩm mới hoặc cập nhật --------------------------- statusPage = 1

  // Tạo sản phẩm mới
  btnCreateNewProduct() {
    if (
      this.productForm.invalid ||
      this.selectedCategories.length === 0 ||
      !this.selectedCategories.length
    ) {
      this.isPictureError = this.uploadedImages.length === 0;
      this.isCategoryError = this.selectedCategories.length === 0;
      this.productForm.markAllAsTouched();
      return;
    }

    this.statusService.statusLoadingSpinnerSource.next(true);

    const formData = this.createFormData();

    this.productService.createFlower(formData).subscribe({
      next: (response: Flower) => {
        this.productForm.reset();
        this.selectedCategories = [];
        this.uploadedImages = [];
        this.listFlower.push(response);
        this.productService.flowerByUserDataSource.next(this.listFlower);
        this.dataSource = new MatTableDataSource(this.listFlower);
        this.dataSource.sort = this.sort;
        this.toastr.success('Tạo hoa mới thành công', 'Success', {
          progressBar: true,
        });
        this.statusPage = 0;
        this.statusService.statusLoadingSpinnerSource.next(false);
      },
      error: (error: HttpErrorResponse) => {
        this.statusService.statusLoadingSpinnerSource.next(false);
        this.toastr.error('Tạo hoa mới thất bại', 'Error');
        console.error('Error creating product: ', error);
      },
    });
  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('name', this.productForm.get('name')!.value);
    formData.append('description', this.productForm.get('description')!.value);
    formData.append('price', this.productForm.get('price')!.value);
    formData.append(
      'stockQuantity',
      this.productForm.get('stockQuantity')!.value
    );
    formData.append('address', this.productForm.get('address')!.value);

    this.selectedCategories.forEach((category) => {
      formData.append('categories', category.id.toString());
    });

    this.fileImages.forEach((fileImage) => {
      formData.append('images', fileImage);
    });

    formData.append(
      'expireDate',
      this.productForm.get('expireDate')!.value.toISOString().split('.')[0]
    );

    return formData;
  }

  // Hover vào danh mục
  setCurrentSelectedCategory(category: ConvertedCategory) {
    this.selectedCurrentCategory = category;
  }

  // Chọn danh mục
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

  // Upload ảnh
  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (this.uploadedImages.length >= 5) {
      this.toastr.warning('Chỉ được tải lên tối đa 5 ảnh', 'Warning', {
        progressBar: true,
      });
      return;
    }

    if (fileInput.files && fileInput.files.length > 0) {
      const fileImage = fileInput.files[0];
      this.fileImages.push(fileImage);
      const uploadedImage = URL.createObjectURL(fileImage);
      this.uploadedImages.push(uploadedImage);
      this.isPictureError = false;
    } else {
      this.uploadedImages = [];
    }
  }

  // Xem chi tiết sản phẩm --------------------------- statusPage = 2
  btnViewProductDetails(id: number) {
    this.listFlower.map((flower) => {
      if (flower.id === id) {
        this.productForm.patchValue({
          name: flower.name,
          price: flower.price,
          description: flower.description,
          stockQuantity: flower.stockQuantity,
          address: flower.address,
        });
        this.selectedProduct = flower;
        (this.uploadedImages = flower.images.map((image) => image.url)),
          (this.selectedCategories = flower.categories);
        this.statusPage = 2;
      }
    });
  }

  // Cập nhật sản phẩm
  btnUpdateProduct() {
    if (
      this.productForm.invalid ||
      this.selectedCategories.length === 0 ||
      !this.uploadedImages
    ) {
      this.isCategoryError = !this.selectedCategories.length;
      this.isPictureError = this.uploadedImages.length === 0;
      this.productForm.markAllAsTouched();
      return;
    }

    this.statusService.statusLoadingSpinnerSource.next(true);

    const formData = this.createFormData();

    this.productService
      .updateFlower(this.selectedProduct?.id!, formData)
      .subscribe({
        next: (response: Flower) => {
          this.toastr.success('Cập nhật thành công', 'Success', {
            progressBar: true,
          });
          this.productForm.patchValue({
            name: response.name,
            price: response.price,
            description: response.description,
            stockQuantity: response.stockQuantity,
            address: response.address,
          });
          this.selectedCategories = response.categories;
          this.listFlower.forEach((flower, index) => {
            if (flower.id === response.id) {
              this.listFlower[index] = response;
            }
          });
          this.productService.flowerByUserDataSource.next(this.listFlower);

          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
          this.statusPage = 0;
          this.statusService.statusLoadingSpinnerSource.next(false);
        },
        error: (error: HttpErrorResponse) => {
          this.statusService.statusLoadingSpinnerSource.next(false);
          this.toastr.error(error.error.message, 'Error');
          console.error('Error update product: ', error);
        },
      });
  }

  removeImage(image: any) {
    this.uploadedImages = this.uploadedImages.filter((img) => img !== image);
  }

  onDragStart(event: DragEvent, image: any) {
    this.draggedImage = image;
    setTimeout(() => {
      const element = event.target as HTMLElement;
      element.classList.add('dragging');
    }, 0);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetImage: any) {
    event.preventDefault();
    const draggedImageIndex = this.uploadedImages.indexOf(this.draggedImage);
    const targetImageIndex = this.uploadedImages.indexOf(targetImage);

    if (draggedImageIndex !== -1 && targetImageIndex !== -1) {
      // Cập nhật vị trí ảnh trong uploadedImages
      const [movedImage] = this.uploadedImages.splice(draggedImageIndex, 1);
      this.uploadedImages.splice(targetImageIndex, 0, movedImage);

      // Cập nhật vị trí ảnh tương ứng trong fileImages
      const [movedFileImage] = this.fileImages.splice(draggedImageIndex, 1);
      this.fileImages.splice(targetImageIndex, 0, movedFileImage);
    }

    const element = event.target as HTMLElement;
    element.classList.remove('dragging');
  }

  get selectedCategoriesLabel(): string {
    return this.selectedCategories.length > 0
      ? this.selectedCategories.map((c) => c.name).join(', ')
      : 'Select Category';
  }

  onAddressChange() {
    const address = this.productForm.get('address')?.value;
    if (address.length >= 10) {
      this.integrationService.getSuggestAddress(address).subscribe({
        next: (response: SuggestAddressResponse) => {
          if (response.success) {
            this.suggestAddresses = response.data;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error('Error parsing address', 'Error');
          console.error('Address parsing error:', error);
        },
      });
    }
  }
}
