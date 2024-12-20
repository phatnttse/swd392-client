import { Utilities } from './../../../../services/utilities';
import { routes } from './../../../../app.routes';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { Flower, FlowerPaginated } from '../../../../models/flower.model';
import { ProductService } from '../../../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DeleteFlowerComponent } from '../../../dialogs/delete-flower/delete-flower.component';
import { MatDialog } from '@angular/material/dialog';

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
    TranslateModule,
    MatLabel,
  ],
  templateUrl: './admin-product-management.component.html',
  styleUrl: './admin-product-management.component.scss',
})
export class AdminProductManagementComponent implements OnInit, AfterViewInit {
  // Biến từ AdminProductManagementComponent
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<Flower> = new MatTableDataSource<Flower>();
  listFlower?: Flower[] = []; // Danh sách hoa
  flower?: Flower;
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
  status: number = 0; //Trạng thái trang
  visiblePages: number[] = []; // Các trang hiển thị
  isRejectFormVisible: boolean = false;
  displayedColumns: string[] = [
    'image',
    'name',
    'price',
    'stockBalance',
    'status',
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
  flowerSubscription: Subscription | null = null; // Biến lưu subscription
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private productService: ProductService,
    public dialog: MatDialog,

  ) {
    (this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.min(1000)]],
      price: ['', [Validators.required, Validators.minLength(100)]],
      stockBalance: ['', [Validators.required, Validators.min(1)]],
      discount: ['', [Validators.min(0)]],
    })),
      (this.rejectForm = this.formBuilder.group({
        reason: ['', [Validators.required, Validators.minLength(100)]],
      }));
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
      .getFlowersAdmin(
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
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = response.totalPages;
          this.numberOfElements = response.numberOfElements;
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

  //Chuyển hướng sang admin-product-detail với id
  btnChangeStatusPage(status: number, flower?: Flower) {
    this.status = status;
    if (flower) {
      this.flower = flower;
    }
  }

  //Chuyển hướng sang trang từ chối
  btnChangeStatusPageRejected(status: number, flower?: Flower) {
    this.status = status;
    if (flower) {
      this.flower = flower;
    }
    this.toggleRejectForm();
  }

  btnBack() {
    this.status = 0;
  }

  btnDeleteFlower(id: number){
    this.productService.deleteFlower(id).subscribe({
      next: (response: FlowerPaginated) => {
        this.toastr.success(`Xóa thành công hoa có ID: ${id}`, 'Thành công');
        this.ngOnInit();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  btnRestoreFlower(id: number){
    this.productService.restoreFlower(id).subscribe({
      next: (response: FlowerPaginated) => {
        this.toastr.success(`Khôi phục thành công hoa có ID: ${id}`, 'Thành công');
        this.ngOnInit();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }


  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(DeleteFlowerComponent, {
      width: '300px',
      data: id
    });

    // Xử lý khi dialog đóng
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toastr.success(`Xóa thành công hoa có ID: ${id}`, `Thành công`);
        this.ngOnInit();
      }
    });
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
    this.visiblePages = Utilities.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }

  toggleRejectForm() {
    this.isRejectFormVisible = !this.isRejectFormVisible;
  }

  trackByIndex(index: number): number {
    return index; // Trả về chỉ số của phần tử
  }

  btnApproveFlower(id: number | undefined) {
    this.productService.approveFlowerListing(id).subscribe({
      next: (response: Flower) => {
        this.flower = response;
        this.listFlower = this.listFlower?.filter((flower) => flower.id !== id);
        this.dataSource = new MatTableDataSource(this.listFlower);
        this.dataSource.sort = this.sort;
        if (this.listFlower !== undefined) {
          this.productService.flowerByUserDataSource.next(this.listFlower);
        }
        this.toastr.success(
          `Duyệt thành công đơn hàng ${response.name} của người dùng ${response.user.name}`
        );
      },
      error: (error) => {
        this.toastr.error(`Duyệt hoa không thành công`, `ERROR`);
      },
    });
  }

  btnDeniedFlower(id: number | undefined, reason: string) {
    if (this.flower !== undefined) {
      this.productService.rejectFlowerListing(id, reason).subscribe({
        next: (response: Flower) => {
          this.flower = response;
          this.listFlower = this.listFlower?.filter(
            (flower) => flower.id !== id
          );
          this.dataSource = new MatTableDataSource(this.listFlower);
          this.dataSource.sort = this.sort;
          if (this.listFlower !== undefined) {
            this.productService.flowerByUserDataSource.next(this.listFlower);
          }
          this.toastr.success(
            `Duyệt thành công đơn hàng ${response.name} của người dùng ${response.user.name}`
          );
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(`Duyệt hoa không thành công`, `ERROR`);
          console.log(error);
        },
      });
    }
  }
}
