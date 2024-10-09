import { FlowerPaginated } from './../../models/flower.model';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Flower } from '../../models/flower.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { InsertUpdateCartResponse } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { Utilities } from '../../services/utilities';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatInputModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  @ViewChild('topElement') topElement!: ElementRef;

  flowerId: number = 0;
  flower: Flower | null = null;
  quantityInput: number = 1;
  listSimilarFlowers: Flower[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.flowerId = +idParam;
      this.getFlowerById();
      this.getSimilarFlowers();
    }
  }

  // Lấy thông tin hoa theo id
  getFlowerById() {
    this.productService.getFlowerById(this.flowerId).subscribe({
      next: (response: Flower) => {
        this.flower = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
  getSimilarFlowers() {
    this.productService
      .getFlowers('', 'asc', 'createdAt', 0, 4, [this.flowerId])
      .subscribe({
        next: (response: FlowerPaginated) => {
          this.listSimilarFlowers = response.content;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  onSimilarFlowerClick(similarFlowerId: number) {
    this.router.navigate(['/product-details', similarFlowerId]);
    this.flowerId = similarFlowerId;
    this.getFlowerById();
    this.getSimilarFlowers();
    this.scrollToTop();
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

  scrollToTop() {
    if (this.topElement) {
      this.topElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  btnIncreaseQuantity() {
    this.quantityInput++;
  }

  bntDecreaseQuantity() {
    if (this.quantityInput > 1) {
      this.quantityInput--;
    }
  }
}
