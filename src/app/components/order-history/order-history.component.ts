import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { OrderService } from '../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Order, OrderResponse } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../models/enums';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [MatTabsModule, CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  listOrder: Order[] = []; // Danh sách đơn hàng

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.getOrderByAccount();
  }

  // Lấy danh sách đơn hàng theo tài khoản
  getOrderByAccount() {
    this.orderService.getOrdersByAccount().subscribe({
      next: (response: OrderResponse) => {
        if (response.success) {
          this.listOrder = response.data;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  isActiveStep(orderStatus: string, stepStatus: string): boolean {
    const statusOrder = [
      OrderStatus.PENDING.toString(),
      OrderStatus.SUCCESS.toString(),
      OrderStatus.PARTIALLY_DELIVERED.toString(),
      OrderStatus.FAILED.toString(),
      OrderStatus.REFUNDED.toString(),
    ];
    return statusOrder.indexOf(orderStatus) >= statusOrder.indexOf(stepStatus);
  }

  step = {
    label: 'Chưa xử lý',
    status: OrderStatus.PENDING,
    icon: 'fa fa-hourglass-start',
    count: 0,
  };

  tabs = [
    { label: 'Chưa xử lý', count: 0 },
    { label: 'Hoàn thành', count: 0 },
    { label: 'Không hoàn thành', count: 0 },
    { label: 'Trả về', count: 0 },
  ];
}
