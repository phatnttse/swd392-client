import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { OrderService } from '../../../../services/order.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Utilities } from '../../../../services/utilities';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderLineChart, OrderReport, OrderReportResponse } from '../../../../models/order.model';
import { ChartOptions } from '../../../../models/dashboard.model';
import { CategoryService } from '../../../../services/category.service';
import { FlowerCategory } from '../../../../models/category.model';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../../../../services/product.service';
import { Flower, FlowerPaginated } from '../../../../models/flower.model';
import { UserAccount, UserAccountPaginatedResponse } from '../../../../models/account.model';
import { AccountService } from '../../../../services/account.service';
import { Role } from '../../../../models/enums';


@Component({
  selector: 'app-admin-dashboard-management',
  standalone: true,
  imports: [ MatCardModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgApexchartsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TranslateModule,],
  templateUrl: './admin-dashboard-management.component.html',
  styleUrl: './admin-dashboard-management.component.scss'
})
export class AdminDashboardManagementComponent {
  @ViewChild('activeusercardchart') chart1: ChartComponent =
    Object.create(null);
  public chartOptions!: Partial<ChartOptions> | any;

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(
      new Date(new Date().setDate(new Date().getDate() - 30))
    ),
    end: new FormControl<Date | null>(
      new Date(new Date().setDate(new Date().getDate()))
    ),
  });
  orderLineChart: OrderLineChart[] = [];
  report: OrderReport | null = null;
  flowerCategories: FlowerCategory[] = []; // Danh sách danh mục đã chuyển đổi
  listFlower ?: Flower[] = []; // Danh sách hoa
  listUser ?: UserAccount[] = [];
  listStaff ?: UserAccount[] = [];
  categoryCount : number = 0;
  flowerCount: number = 0;
  userCount: number =0;
  searchString: string = ''; 
  order: string = 'desc'; 
  sortBy: string = 'createdAt';
  roleName: Role[] ; 
  


  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private flowerService: ProductService,
    private accountService: AccountService
  ) {
    this.chartOptions = {};
    this.roleName = [Role.ADMIN, Role.MANAGER, Role.USER]
  }

  ngOnInit(): void {
    this.getOrderLineChart();
    this.getReport();
    this.countCategory();
    this.countFlower();
    this.countUsers('', '', '', this.roleName);
    this.countStaffs('', '', '', this.roleName);
  }

  // Lấy dữ liệu cho biểu đồ
  getOrderLineChart() {
    const startDate = Utilities.formatDate(this.range.get('start')?.value!);
    const endDate = Utilities.formatDate(this.range.get('end')?.value!);
    this.orderService.getOrderLineChart(startDate, endDate).subscribe({
      next: (response: OrderLineChart[]) => {
        this.orderLineChart = response;
        this.chartOptions = {
          series: [
            {
              name: 'Doanh thu',
              data: response.map((item) => item.price),
              color: '#fb9678',
            },
            {
              name: 'Số đơn hàng',
              data: response.map((item) => item.orderCount),
              color: '#03c9d7',
            },
          ],
          xaxis: {
            categories: response.map((item) => item.time),
          },
          yaxis: {
            labels: {
              formatter: (val: number) => {
                return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
              },
            },
          },
          tooltip: {
            y: [
              {
                formatter: (val: number) => {
                  return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
                },
                title: {
                  formatter: () => 'Doanh thu',
                },
              },
              {
                formatter: (val: number) => {
                  return val.toString(); // Chỉ đơn giản chuyển sang chuỗi
                },
                title: {
                  formatter: () => 'Số đơn hàng',
                },
              },
            ],
          },
          chart: {
            toolbar: {
              show: false,
            },
            type: 'line',
            height: 300,
          },
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            width: 5,
            colors: ['none'],
          },
          plotOptions: {
            bar: {
              columnWidth: '45%',
              borderRadius: 6,
            },
          },
        };
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  // Lấy báo cáo
  getReport() {
    const startDate = Utilities.formatDate(this.range.get('start')?.value!);
    const endDate = Utilities.formatDate(this.range.get('end')?.value!);
    this.orderService.getOrderReport(startDate, endDate).subscribe({
      next: (response: OrderReportResponse) => {
        if (response.success) {
          this.report = response.data;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
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
      this.getOrderLineChart();
    }
  }

  //Đếm số lượng danh mục
  countCategory(){
    this.categoryService.categoryData$.subscribe(
      (categoryData: FlowerCategory[]) => {
        this.flowerCategories = categoryData;
        this.categoryCount = this.flowerCategories.length; // Count categories
        console.log('Category count:', this.categoryCount);
        console.log(categoryData);
      }
    );
    
  }

  //Đếm số lượng hoa
  countFlower() {
    const largePageSize = 10000;
  this.flowerService
    .getFlowers('', 'asc', 'name', 1, largePageSize, [])
    .subscribe({
      next: (response: FlowerPaginated) => {
        this.flowerCount = response.content.length;
        console.log('Total flower count:', this.flowerCount);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching all flower data:', error);
      },
    });
  }

  //Đếm số lượng user
  countUsers(
    searchString: string,
    order: string,
    sortBy: string,
    roleName: Role[]
  ) {
    const largePageSize = 10000000; 
    
    this.accountService.getUsers(
      searchString,
      order,
      sortBy,
      0,            
      largePageSize, 
      roleName
    ).subscribe({
      next: (response: UserAccountPaginatedResponse) => {
        this.listUser = response.data.content.filter(user => user.role == Role.USER);
        this.userCount = this.listUser.length;
        console.log('Total user count:', this.userCount);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching user count:', error);
      },
    });
  }

    //Đếm số lượng nhân viên
    countStaffs(
      searchString: string,
      order: string,
      sortBy: string,
      roleName: Role[]
    ) {
      const largePageSize = 10000000; 
      
      this.accountService.getUsers(
        searchString,
        order,
        sortBy,
        0,            
        largePageSize, 
        roleName
      ).subscribe({
        next: (response: UserAccountPaginatedResponse) => {
          this.listStaff = response.data.content.filter(user => user.role == Role.MANAGER);
          this.userCount = this.listStaff.length;
          console.log('Total user count:', this.userCount);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching user count:', error);
        },
      });
    }
}
