import { MatCardModule } from '@angular/material/card';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Flower, FlowerPaginated } from '../../../models/flower.model';
import { LocalStoreManager } from '../../../services/local-storage.service';
import { DBkeys } from '../../../services/db-keys';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-product-management',
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
  ],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss',
})
export class ProductManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<Flower> = new MatTableDataSource<Flower>();
  listFlower?: Flower[] = []; // Danh sách hoa
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
  displayedColumns: string[] = [
    'image',
    'name',
    'category',
    'price',
    'stockBalance',
    'action',
  ];

  constructor(
    private localStorage: LocalStoreManager,
    private productService: ProductService
  ) {}

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
    this.currentPage =
      Number(this.localStorage.getData(DBkeys.CURRENT_PRODUCTS_PAGE)) || 0;
    this.productService
      .getFlowers(
        searchString,
        order,
        sortBy,
        this.currentPage,
        pageSize,
        categoryIds
      )
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.dataSource = new MatTableDataSource(response.content);
          this.dataSource.sort = this.sort;
          this.listFlower = response.content;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = response.totalPages;
          this.numberOfElements = response.numberOfElements;
          this.totalElements = response.totalElements;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages + 1, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.localStorage.savePermanentData(
      String(page),
      DBkeys.CURRENT_PRODUCTS_PAGE
    );
    this.getFlowers(
      this.searchString,
      this.order,
      this.sortBy,
      page,
      this.pageSize,
      this.categoryIds
    );
  }
}
