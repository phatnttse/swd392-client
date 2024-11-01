import { Component, OnInit, signal } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { OrderService } from '../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  OrderByAccount,
  OrderByAccountResponse,
  UpdateOrderStatusResponse,
} from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { OrderDetailStatus } from '../../models/enums';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CancelOrderComponent } from '../dialogs/cancel-order/cancel-order.component';
import { ToastrService } from 'ngx-toastr';
import { Utilities } from '../../services/utilities';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbComponent,
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  listOrder: OrderByAccount[] = []; // Danh sách đơn hàng
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 6; // Số lượng sản phẩm trên mỗi trang
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  selectedStatus: string = OrderDetailStatus.PENDING; // Trạng thái đã chọn
  reasonCancelOrder: string = ''; // Lý do hủy đơn hàng
  loadingBtn = signal(false);
  orderDetailStatus = OrderDetailStatus;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getOrderByBuyer(
      this.order,
      this.sortBy,
      this.pageNumber,
      this.pageSize,
      this.selectedStatus
    );
  }

  // Lấy danh sách đơn hàng theo người mua
  getOrderByBuyer(
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    selectedStatus: string
  ) {
    this.orderService
      .getOrdersByAccount(order, sortBy, pageNumber, pageSize, selectedStatus)
      .subscribe({
        next: (response: OrderByAccountResponse) => {
          if (response.success) {
            this.listOrder = response.data.content;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
            this.visiblePages = Utilities.generateVisiblePageArray(
              this.currentPage,
              this.totalPages
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  btnOpenCancelOrderDialog(id: number) {
    const dialogRef = this.dialog.open(CancelOrderComponent, {
      data: id,
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      debugger;
      if (result) {
        this.getOrderByBuyer(
          this.order,
          this.sortBy,
          this.pageNumber,
          this.pageSize,
          this.selectedStatus
        );
        this.toastr.success('Hủy đơn hàng thành công');
      }
    });
  }

  isActiveStep(orderStatus: string, stepStatus: string): boolean {
    const statusOrder = [
      OrderDetailStatus.PENDING.valueOf(),
      OrderDetailStatus.PREPARING.valueOf(),
      OrderDetailStatus.SHIPPED.valueOf(),
      OrderDetailStatus.DELIVERED.valueOf(),
    ];
    return statusOrder.indexOf(orderStatus) >= statusOrder.indexOf(stepStatus);
  }

  steps = [
    {
      label: 'Chưa xử lý',
      status: OrderDetailStatus.PENDING,
      icon: 'fa fa-hourglass-start',
    },
    {
      label: 'Đang chuẩn bị',
      status: OrderDetailStatus.PREPARING,
      icon: 'fa fa-cogs',
    },
    {
      label: 'Đang giao',
      status: OrderDetailStatus.SHIPPED,
      icon: 'fa fa-truck',
    },
    {
      label: 'Đã giao',
      status: OrderDetailStatus.DELIVERED,
      icon: 'fa fa-check',
    },
  ];

  nonProcessSteps = [
    {
      label: 'Đã hủy (Người mua)',
      status: OrderDetailStatus.BUYER_CANCELED,
      icon: 'fa fa-times-circle',
    },
    {
      label: 'Đã hủy (Người bán)',
      status: OrderDetailStatus.SELLER_CANCELED,
      icon: 'fa fa-times-circle',
    },
    {
      label: 'Đã hoàn tiền',
      status: OrderDetailStatus.REFUNDED,
      icon: 'fa fa-undo',
    },
  ];

  tabs = [
    { label: 'Chưa xử lý', count: 0 },
    { label: 'Đang chuẩn bị', count: 0 },
    { label: 'Đang giao', count: 0 },
    { label: 'Đã giao', count: 0 },
  ];

  isNonProcessStatus(orderStatus: string): boolean {
    return (
      orderStatus === OrderDetailStatus.BUYER_CANCELED ||
      orderStatus === OrderDetailStatus.SELLER_CANCELED ||
      orderStatus === OrderDetailStatus.REFUNDED
    );
  }

  onTabChange(event: MatTabChangeEvent): void {
    const selectedIndex = event.index;

    // Map the selected tab index to its corresponding status
    switch (selectedIndex) {
      case 0:
        this.selectedStatus = OrderDetailStatus.PENDING;
        break;
      case 1:
        this.selectedStatus = OrderDetailStatus.PREPARING;
        break;
      case 2:
        this.selectedStatus = OrderDetailStatus.SHIPPED;
        break;
      case 3:
        this.selectedStatus = OrderDetailStatus.DELIVERED;
        break;
      default:
        this.selectedStatus = '';
        break;
    }

    // Fetch orders based on the selected status
    this.getOrderByBuyer(
      this.order,
      this.sortBy,
      this.pageNumber,
      this.pageSize,
      this.selectedStatus
    );
  }

  // Xử lý khi thay đổi trang
  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.getOrderByBuyer(
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.selectedStatus
    );
    this.visiblePages = Utilities.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }
}
