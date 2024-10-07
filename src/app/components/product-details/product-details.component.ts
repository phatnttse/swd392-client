import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Flower } from '../../models/flower.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  flowerId: number = 0;
  flower: Flower | null = null;
  quantityInput: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.flowerId = +idParam;
      this.getFlowerById();
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

  btnIncreaseQuantity() {
    this.quantityInput++;
  }

  bntDecreaseQuantity() {
    if (this.quantityInput > 1) {
      this.quantityInput--;
    }
  }
}
