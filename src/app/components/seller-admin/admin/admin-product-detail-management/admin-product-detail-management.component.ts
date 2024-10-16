import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flower } from '../../../../models/flower.model';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-product-detail-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatTooltipModule,
    CommonModule],
  templateUrl: './admin-product-detail-management.component.html',
  styleUrl: './admin-product-detail-management.component.scss'
})
export class AdminProductDetailManagementComponent {
  productForm: FormGroup;
  selectedCategoryId: number = 0;
  selectedSubCategoryId: number = 0;
  selectedCategoryName: string | null = null;
  selectedSubCategoryName: string | null = null;
  uploadedImage = '';
  uploadedImages: string[] = [];
  isDisabled: boolean = false;
  isCategoryError: boolean = false;
  isPictureError: boolean = false;
  listFlower?: Flower[] = [];;
  flower?: Flower | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private categoryService : CategoryService
  ) {
    // this.categoriesWithSubcategories$ =
    //   this.categoryService.categoriesWithSubcategories$;

    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.min(1000)]],
      price: ['', [Validators.required, Validators.minLength(100)]],
      stockBalance: ['', [Validators.required, Validators.min(1)]],
      discount: ['', [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    const slug = this.activatedRoute.snapshot.paramMap.get('id');
  if (slug) {
    // Chuyển slug sang số nguyên trước khi gọi hàm getProductDetails
    const productId = parseInt(slug, 10); 
    if (!isNaN(productId)) {
      this.getProductDetails(productId);
    } else {
      console.error('ID không hợp lệ:', slug);
    }
  }
  }


  getProductDetails(id: number) {
    this.productService.getFlowerById(id).subscribe({
      next: (response) => {
        this.flower = response;
        //this.selectedCategoryId = response.category.id;
        // this.selectedSubCategoryId = response.subCategory.id;
        // this.selectedCategoryName = response.category.name;
        // this.selectedSubCategoryName = response.subCategory.name;
        this.productForm.patchValue(response);
      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        console.error(error?.error?.message ?? '');
      },
    });
  }


  approveFlower(id: number){
    if(this.flower !== undefined){
      this.productService.approveFlowerListing(id).subscribe(
        (response) => {
          console.log('Flower approved:', response);
          this.flower!.status = 'APPROVED';
        },
        (error) => {
          console.error('Error approving flower:', error);
        }
      )
    }
  }

  processResults = (error: any, result: any): void => {
    if (result.event === 'close') {
      this.isDisabled = false;
    }
    if (result && result.event === 'success') {
      const secureUrl = result.info.secure_url;
      const previewUrl = secureUrl.replace('/upload/', '/upload/w_600/');
      this.uploadedImages.push(previewUrl);
      localStorage.setItem(
        'uploadedProductImages',
        JSON.stringify(this.uploadedImages)
      );
    }
    if (error) {
      this.isDisabled = false;
    }
  };


}
