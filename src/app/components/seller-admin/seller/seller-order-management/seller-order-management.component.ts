import {
  Order,
  OrderByAccountResponse,
} from './../../../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
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
import { OrderService } from '../../../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderDetailStatus } from '../../../../models/enums';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
export class SellerOrderManagementComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  listOrder: any[] = []; // Danh sách đơn hàng
  statusPage: number = 0; // Trang hiện tại
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
  status: string[] = ['PENDING']; // Trạng thái của sản phẩm
  startDate: Date = new Date(); // Ngày bắt đầu
  endDate: Date = new Date(); // Ngày kết thúc
  numberOfElements: number = 0; // Số lượng sản phẩm hiện tại
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  orderStatuses = Object.values(OrderDetailStatus); // Trạng thái của chi tiết đơn hàng
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private orderService: OrderService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.orderService.orderBySellerDataSource.subscribe(
      (orderBySellerData: any) => {
        if (orderBySellerData != null) {
          this.listOrder = orderBySellerData;
          this.dataSource = new MatTableDataSource(this.listOrder);
          this.dataSource.sort = this.sort;
        } else {
          this.getOrdersBySeller(
            this.searchString,
            this.order,
            this.sortBy,
            this.currentPage,
            this.pageSize,
            this.status
          );
        }
      }
    );
  }

  getOrdersBySeller(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    status: string[]
  ) {
    this.orderService
      .getOrdersBySeller(
        searchString,
        order,
        sortBy,
        pageNumber,
        pageSize,
        status
      )
      .subscribe({
        next: (response: OrderByAccountResponse) => {
          if (response.success) {
            console.log(response);
            this.listOrder = response.data.content;
            this.dataSource = new MatTableDataSource(this.listOrder);
            this.dataSource.sort = this.sort;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
            this.numberOfElements = response.data.numberOfElements;
            this.orderService.orderBySellerDataSource.next(this.listOrder);
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

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
  }

  onTabChange(event: any) {}
}
