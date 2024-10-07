import { Component, OnInit } from '@angular/core';
import { Flower, FlowerPaginated } from '../../models/flower.model';
import { ProductService } from '../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StatusService } from '../../services/status.service';
import { Router, RouterModule } from '@angular/router';

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
