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
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { FlowerCategory } from '../../models/category.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TruncatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  listFlowerNewest?: Flower[] = [];
  searchString: string = '';
  order: string = 'desc';
  sortBy: string = 'createdAt';
  totalPages: number = 0;
  pageNumber: number = 0;
  pageSize: number = 16;
  categoryIds: number[] = [];
  numberOfElements: number = 0;
  totalElements: number = 0;
  listCategory: FlowerCategory[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.productService.flowerNewestDataSource.subscribe(
      (flowerNewestData: FlowerPaginated | null) => {
        if (flowerNewestData !== null) {
          this.listFlowerNewest = flowerNewestData.content;
        }
      }
    );
    this.categoryService.categoryDataSource.subscribe(
      (categoryData: FlowerCategory[]) => {
        if (categoryData) {
          this.listCategory = categoryData;
        }
      }
    );
  }

  // Chuyển đến trang sản phẩm theo danh mục
  goToProductListPageByCategory(categoryId: number) {
    this.router.navigate(['/products'], {
      queryParams: { c: categoryId },
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
