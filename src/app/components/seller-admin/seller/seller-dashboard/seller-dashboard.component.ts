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
import {
  OrderLineChart,
  OrderReport,
  OrderReportResponse,
} from '../../../../models/order.model';
import { ChartOptions } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NgApexchartsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.scss',
})
export class SellerDashboardComponent implements OnInit {
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

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    this.chartOptions = {};
  }

  ngOnInit(): void {
    this.getOrderLineChart();
    this.getReport();
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
}
