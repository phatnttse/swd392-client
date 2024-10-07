import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { Flower, FlowerPaginated } from '../../models/flower.model';
import { ProductService } from '../../services/product.service';
import { StatusService } from '../../services/status.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule,
    MatPaginatorModule,
    MatMenuModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  listFlower?: Flower[] = [];
  searchString: string = '';
  order: string = 'desc';
  sortBy: string = 'createdAt';
  totalPages: number = 0;
  pageNumber: number = 0;
  pageSize: number = 16;
  categoryIds: number[] = [];
  numberOfElements: number = 0;
  totalElements: number = 0;

  constructor(
    private productService: ProductService,
    private statusService: StatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.flowerDataSource.subscribe((flowerData) => {
      if (flowerData) {
        this.listFlower = flowerData;
      } else {
        this.getFlowers(
          this.searchString,
          this.order,
          this.sortBy,
          this.pageNumber,
          this.pageSize,
          [1]
        );
      }
    });
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
      .getFlowers(
        searchString,
        order,
        sortBy,
        pageNumber,
        pageSize,
        categoryIds
      )
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.listFlower = response.content;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = response.totalPages;
          this.numberOfElements = response.numberOfElements;
          this.totalElements = response.totalElements;
          this.productService.flowerDataSource.next(response.content); // Lưu vào BehaviorSubject
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  viewFlowerDetails(id: number) {
    this.router.navigate(['/product-details', id]);
  }
}
