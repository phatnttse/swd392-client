import {
  Order,
  OrderByAccount,
  OrderByAccountResponse,
  OrderResponse,
  UpdateOrderStatusResponse,
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { OrderService } from '../../../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderDetailStatus } from '../../../../models/enums';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Utilities } from '../../../../services/utilities';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { StatusService } from '../../../../services/status.service';
import { MatDialog } from '@angular/material/dialog';
import { CancelOrderComponent } from '../../../dialogs/cancel-order/cancel-order.component';

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
    TranslateModule,
    MatSortModule,
  ],
  templateUrl: './seller-order-management.component.html',
  styleUrl: './seller-order-management.component.scss',
})
export class SellerOrderManagementComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatSort) sort!: MatSort;

  listOrder: OrderByAccount[] = []; // Danh sách đơn hàng (dùng để lọc)
  listOrderDefault: OrderByAccount[] = []; // Danh sách tất cả đơn hàng mặc định (dùng để reset lọc)
  statusPage: number = 0; // Trang hiện tại 0: Danh sách order, 1: Chi tiết order, 2: order khi search,date,status
  displayedColumns: string[] = [
    // Các cột hiển thị
    'buyerName',
    'buyerPhone',
    'productName',
    'amount',
    'orderDate',
    'status',
    'action',
  ];
  dataSource: MatTableDataSource<OrderByAccount> =
    new MatTableDataSource<OrderByAccount>(); // Dữ liệu bảng
  searchString: string = ''; // Chuỗi tìm kiếm
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 10; // Số lượng đơn hàng trên mỗi trang
  startDate: string = ''; // Ngày bắt đầu
  endDate: string = ''; // Ngày kết thúc
  totalElements: number = 0; // Tổng số lượng đơn hàng
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  orderStatuses = Object.values(OrderDetailStatus); // Danh sách trạng thái của chi tiết đơn hàng
  orderDetailStatus = OrderDetailStatus; // Trạng thái của chi tiết đơn hàng
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  selectedStatus: string = ''; // Trạng thái được chọn
  orderBySellerSubscription: Subscription = new Subscription(); // Subscription lấy danh sách đơn hàng
  selectedOrder: OrderByAccount | null = null; // Đơn hàng được chọn xem chi tiết
  reason: string = ''; // Lý do hủy đơn hàng

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private statusService: StatusService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.orderBySellerSubscription = this.orderService.orderBySeller$.subscribe(
      (response: OrderByAccountResponse | null) => {
        if (response) {
          this.listOrder = response.data.content;
          this.listOrderDefault = response.data.content;
          this.dataSource = new MatTableDataSource(this.listOrder);
          this.dataSource.sort = this.sort;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.visiblePages = Utilities.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
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
    this.statusService.statusLoadingSpinnerSource.next(true);
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
            this.visiblePages = Utilities.generateVisiblePageArray(
              this.currentPage,
              this.totalPages
            );
            this.statusService.statusLoadingSpinnerSource.next(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.statusService.statusLoadingSpinnerSource.next(false);
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

  // Xem chi tiết đơn hàng
  btnViewOrderDetail(order: OrderByAccount): void {
    this.selectedOrder = order;
    this.btnChangeStatusPage(1);
  }

  // Cập nhật trạng thái của đơn hàng
  btnUpdateOrderStatus(orderDetailId: number): void {
    this.statusService.statusLoadingSpinnerSource.next(true);
    const nextStatus = this.getNextOrderStatus(this.selectedOrder?.status!);

    this.orderService
      .updateOrderStatus(orderDetailId, this.reason, nextStatus)
      .subscribe({
        next: (response: UpdateOrderStatusResponse) => {
          if (response.success) {
            this.toastr.success(response.message, 'Success', {
              progressBar: true,
            });
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.selectedOrder!.status = response.data.status;
          } else {
            this.toastr.error(response.message, 'Error', { progressBar: true });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.statusService.statusLoadingSpinnerSource.next(false);
          this.toastr.error(error.error.message, 'Error');
        },
      });
  }

  // Mở dialog hủy đơn hàng
  btnOpenCancelOrderDialog(orderId: number): void {
    const dialogRef = this.dialog.open(CancelOrderComponent, {
      data: {
        orderId: orderId,
        orderStatus: OrderDetailStatus.SELLER_CANCELED,
      },
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        const updatedListOrder = this.listOrder.map((order) => {
          if (order.id === orderId) {
            order.status = OrderDetailStatus.SELLER_CANCELED;
          }
          return order;
        });
        this.listOrder = updatedListOrder;
        this.listOrderDefault = updatedListOrder;
        this.dataSource = new MatTableDataSource(this.listOrder);
        this.dataSource.sort = this.sort;
        this.toastr.success('Hủy đơn hàng thành công', 'Success', {
          progressBar: true,
        });
      }
    });
  }
  // Lấy trạng thái tiếp theo của đơn hàng
  private getNextOrderStatus(
    currentStatus: OrderDetailStatus
  ): OrderDetailStatus {
    switch (currentStatus) {
      case OrderDetailStatus.PENDING:
        return OrderDetailStatus.PREPARING;
      case OrderDetailStatus.PREPARING:
        return OrderDetailStatus.SHIPPED;
      case OrderDetailStatus.SHIPPED:
        return OrderDetailStatus.DELIVERED;
      default:
        return currentStatus;
    }
  }

  // Hàm để lấy text hiển thị cho Button
  getStatusButtonText(currentStatus: OrderDetailStatus): string {
    switch (currentStatus) {
      case OrderDetailStatus.PENDING:
        return 'ConfirmPreparing';
      case OrderDetailStatus.PREPARING:
        return 'ConfirmShipping';
      default:
        return 'ConfirmPreparing';
    }
  }

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
  }
  clearFilters() {
    // Reset các giá trị của bộ lọc
    this.selectedStatus = '';
    this.range.reset();
    this.startDate = '';
    this.endDate = '';
    this.dataSource = new MatTableDataSource(this.listOrderDefault);
    this.dataSource.sort = this.sort;
  }
  // Xử lý khi thay đổi trang
  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
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
    this.visiblePages = Utilities.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }
}
