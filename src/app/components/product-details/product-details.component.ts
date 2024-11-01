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
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Feedback } from '../../models/feedback.model';
import { ParentCategory } from '../../models/enums';
import { TypeTransformPipe } from '../../pipes/type-transform.pipe';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    RouterModule,
    CommonModule,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TypeTransformPipe,
    BreadcrumbComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  @ViewChild('topElement') topElement!: ElementRef;

  flowerId: number = 0; // Id hoa
  flower: Flower | null = null; // Thông tin hoa
  quantityInput: number = 1; // Số lượng sản phẩm
  listSimilarFlowers: Flower[] = []; // Danh sách hoa tương tự
  rating = 0; // Đánh giá sao
  listFeedback: Feedback[] = []; // Danh sách bình luận
  feedBackForm: FormGroup; // Form bình luận
  parentCategory = ParentCategory; // Enum danh mục cha
  currentImageUrl: string | undefined; // Ảnh chính hiện tại
  selectedImageIndex: number = 0; // Index ảnh được chọn

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    this.feedBackForm = this.formBuilder.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

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
        this.currentImageUrl = response.images[0].url;
      },
      complete: () => {
        this.getFeedBacksByFlowerId();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  // Lấy danh sách hoa tương tự
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

  // Chuyển đến trang chi tiết sản phẩm khác
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
        this.toastr.error(error.error.message);
      },
    });
  }

  btnBuyNow(flowerId: number, quantity: number) {
    this.cartService.insertUpdateCart(flowerId, quantity).subscribe({
      next: (response: InsertUpdateCartResponse) => {
        if (response.data && response.success && response.code === 200) {
          this.router.navigate(['/cart']);
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

  // Cuộn lên đầu trang
  scrollToTop() {
    if (this.topElement) {
      this.topElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Tăng số lượng input
  btnIncreaseQuantity() {
    if (this.flower && this.quantityInput < this.flower.stockQuantity) {
      this.quantityInput++;
    }
  }

  // Giảm số lượng input
  bntDecreaseQuantity() {
    if (this.quantityInput > 1) {
      this.quantityInput--;
    }
  }

  btnVisitShop() {
    const name = Utilities.formatStringToSlug(this.flower?.user.name || '');
    this.router.navigate(['/seller-profile', `${name}`], {
      queryParams: { shop: this.flower?.user.id },
    });
  }

  onThumbnailClick(imageUrl: string, index: number): void {
    this.currentImageUrl = imageUrl;
    this.selectedImageIndex = index;
  }

  rate(star: number) {
    this.rating = star;
  }

  getFeedBacksByFlowerId() {
    this.productService.getFeedbacksByFlowerId(this.flowerId).subscribe({
      next: (response: Feedback[]) => {
        this.listFeedback = response;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  btnSubmitFeedback() {
    if (this.feedBackForm.invalid) {
      this.feedBackForm.markAllAsTouched();
      return;
    }
    if (this.rating === 0) {
      this.toastr.warning('Vui lòng chọn số sao');
      return;
    }

    this.productService
      .createFeedback(
        this.flowerId,
        this.feedBackForm.value.content,
        this.rating
      )
      .subscribe({
        next: (response: Feedback) => {
          this.feedBackForm.reset();
          this.rating = 0;
          this.listFeedback.push(response);
          this.toastr.success(
            `Cảm ơn bạn đã đánh giá cho ${this.flower?.name}`
          );
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.toastr.error(error.error.message);
        },
      });
  }
}
