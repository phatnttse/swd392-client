import { Utilities } from './../../services/utilities';
import { Component, OnInit } from '@angular/core';
import { Flower, FlowerPaginated } from '../../models/flower.model';
import { ProductService } from '../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { InsertUpdateCartResponse } from '../../models/cart.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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
  listCategory: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService,
    private categoryService: CategoryService
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
          this.categoryIds
        );
      }
    });
    this.categoryService.convertedCategoryDataSource.subscribe(
      (categoryData: any[]) => {
        if (categoryData) {
          this.listCategory = categoryData;
        }
      }
    );
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

  // Xem chi tiết sản phẩm
  viewFlowerDetails(id: number) {
    this.router.navigate(['/product-details', id]);
  }

  // Thêm hoặc cập nhật sản phẩm trong giỏ hàng
  btnInsertUpdateCart(flowerId: number, quantity: number) {
    this.cartService.insertUpdateCart(flowerId, quantity).subscribe({
      next: (response: InsertUpdateCartResponse) => {
        if (response.data && response.success && response.code === 200) {
          this.toastr.success(
            `Bạn vừa thêm ${response.data.flowerName} vào giỏ hàng`,
            'Thành công',
            { progressBar: true, positionClass: 'toast-bottom-right' }
          );
          Utilities.openOffCanvas('offcanvasCart');
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.toastr.error(error.error.error);
      },
    });
  }
}
