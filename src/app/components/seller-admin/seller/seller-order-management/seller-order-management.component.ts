import {
  Order,
  OrderByAccountResponse,
} from './../../../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { OrderService } from '../../../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderDetailStatus } from '../../../../models/enums';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Utilities } from '../../../../services/utilities';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seller-order-management',
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
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './seller-order-management.component.html',
  styleUrl: './seller-order-management.component.scss',
})
export class SellerOrderManagementComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatSort) sort!: MatSort;

  listOrder: any[] = []; // Danh sách đơn hàng
  statusPage: number = 0; // Trang hiện tại 0: Danh sách order, 1: Chi tiết order, 2: order khi search,date,status
  displayedColumns: string[] = [
    // Các cột hiển thị
    'buyerName',
    'buyerPhone',
    'productImage',
    'productName',
    'amount',
    'status',
    'action',
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(); // Dữ liệu bảng
  searchString: string = ''; // Chuỗi tìm kiếm
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 8; // Số lượng sản phẩm trên mỗi trang
  startDate: string = ''; // Ngày bắt đầu
  endDate: string = ''; // Ngày kết thúc
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  orderStatuses = Object.values(OrderDetailStatus); // Trạng thái của chi tiết đơn hàng
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  selectedStatus: string = OrderDetailStatus.PENDING; // Trạng thái được chọn
  orderBySellerSubscription: Subscription = new Subscription(); // Subscription lấy danh sách đơn hàng

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.orderBySellerSubscription = this.orderService.orderBySeller$.subscribe(
      (response: OrderByAccountResponse | null) => {
        if (response) {
          this.listOrder = response.data.content;
          this.dataSource = new MatTableDataSource(this.listOrder);
          this.dataSource.sort = this.sort;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        }
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.orderBySellerSubscription.unsubscribe();
  }

  // Lấy danh sách đơn hàng theo người bán
  getOrdersBySeller(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    selectedStatus: string,
    startDate?: string,
    endDate?: string,
    isFilter: boolean = false
  ) {
    this.orderService
      .getOrdersBySeller(
        searchString,
        order,
        sortBy,
        pageNumber,
        pageSize,
        selectedStatus,
        startDate,
        endDate
      )
      .subscribe({
        next: (response: OrderByAccountResponse) => {
          if (response.success) {
            if (isFilter) {
              this.dataSource = new MatTableDataSource(response.data.content);
            } else {
              this.listOrder = response.data.content;
              this.dataSource = new MatTableDataSource(this.listOrder);
            }
            this.dataSource.sort = this.sort;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  // Tìm kiếm sản phẩm theo angular material table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Xử lý khi chọn ngày bắt đầu
  onStartDateChange(event: any): void {
    const startDate = event.value;
    const currentDate = new Date();
    if (startDate && startDate >= currentDate) {
      this.range.get('start')?.setValue(null); // Reset the start date
      this.toastr.warning(
        'Ngày bắt đầu không được lớn hơn ngày hiện tại',
        'Warning'
      );
    } else {
      this.startDate = Utilities.formatDate(startDate);
    }
  }

  // Xử lý khi chọn ngày kết thúc
  onEndDateChange(event: any): void {
    const endDate = event.value;
    const currentDate = new Date();
    if (endDate && endDate >= currentDate) {
      this.range.get('end')?.setValue(null); // Reset the end date
      this.toastr.warning(
        'Ngày kết thúc không được lớn hơn ngày hiện tại',
        'Warning'
      );
    } else {
      this.endDate = Utilities.formatDate(endDate);
      this.getOrdersBySeller(
        this.searchString,
        this.order,
        this.sortBy,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.startDate,
        this.endDate,
        true
      );
    }
  }

  onFilterChange(): void {
    this.getOrdersBySeller(
      this.searchString,
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.selectedStatus,
      this.startDate,
      this.endDate,
      true
    );
  }

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
  }
}
