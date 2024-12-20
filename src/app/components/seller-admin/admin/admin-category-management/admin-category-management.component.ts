import { LocalStoreManager } from './../../../../services/local-storage.service';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../../../services/category.service';
import { FlowerCategory } from '../../../../models/category.model';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { ParentCategory } from '../../../../models/enums';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteFlowerComponent } from '../../../dialogs/delete-flower/delete-flower.component';
import { DeleteCategoryComponent } from '../../../dialogs/delete-category/delete-category.component';

@Component({
  selector: 'app-admin-category-management',
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
    CommonModule,
    MatPaginator,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    TranslateModule
  ],
  templateUrl: './admin-category-management.component.html',
  styleUrl: './admin-category-management.component.scss',
})
export class AdminCategoryManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  flowerCategories: FlowerCategory[] = []; // Danh sách danh mục đã chuyển đổi
  dataSource: MatTableDataSource<FlowerCategory> =
    new MatTableDataSource<FlowerCategory>();
  displayColumns: string[] = ['id', 'image', 'name', 'action'];
  statusPage: number = 0; // trạng thái của trang 0: all, 1: create , 2: update
  selectedCategory: FlowerCategory | null = null;
  categoryForm: FormGroup; // Biến categoryForm
  uploadedImage: string = ''; // Ảnh đã tải lên
  fileImage: File | null = null; // File ảnh
  isPictureError: boolean = false; // Lỗi không tải ảnh
  categories = Object.values(ParentCategory);
  isRejectFormVisible: boolean = false;
  selectedCategoryParent: string | null = null; // Biến để lưu giá trị được chọn
  searchQuery: string = ''; // Biến để lưu từ khóa tìm kiếm

  constructor(
    private categoryService: CategoryService,
    public dialog: MatDialog,
    public route: Router,
    private fb: FormBuilder, // Thêm FormBuilder
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      // Khởi tạo categoryForm
      name: ['', Validators.required], // Thêm trường name với validator
      parentCategory: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  findSelectedCategoryById(id: number) {
    this.selectedCategory =
      this.flowerCategories.find((category) => category.id === id) ?? null;
  }

  ngOnInit() {
    this.categoryService.categoryData$.subscribe(
      (categoryData: FlowerCategory[]) => {
        this.flowerCategories = categoryData;
        this.dataSource = new MatTableDataSource(this.flowerCategories);
        this.dataSource.sort = this.sort;
        console.log(categoryData)
      }
    );

  }

  // Thay đổi trạng thái của trang
  btnChangeStatusPage(status: number, category?: FlowerCategory) {
    this.statusPage = status;
    if (category) {
      this.selectedCategory = category;
      this.categoryForm.patchValue({
        name: category.name,
        parentCategory: category.categoryParent,
        image: category.imageUrl,
      });
    }
  }

  // Upload ảnh
  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.fileImage = fileInput.files[0];
      this.uploadedImage = URL.createObjectURL(this.fileImage);
      this.isPictureError = false;
    } else {
      this.uploadedImage = '';
    }
  }

  //Thêm danh mục mới
  adminCreateNewCategory() {
    if (this.categoryForm.invalid || !this.uploadedImage) {
      this.isPictureError = !this.uploadedImage;
      this.categoryForm.markAllAsTouched();
      return;
    }

      
      //Form 
      const formData = this.createFormData();
      // Gọi service để lưu danh mục mới vào database
      this.categoryService.addNewCategory(formData).subscribe(
        {
          next: (response: FlowerCategory) => {
            this.categoryForm.reset();
            this.uploadedImage = '';
            this.toastr.success('Tạo danh mục mới thành công', 'Success', {
              progressBar: true,
            });
            this.flowerCategories.push(response);
            this.dataSource = new MatTableDataSource(this.flowerCategories);
            this.dataSource.sort = this.sort;
            this.categoryService.categoryDataSource.next(this.flowerCategories);
            this.statusPage = 0;
          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error('Tạo hoa mới thất bại', 'Error');
            console.error('Error creating product: ', error);
          },
        }
       );

  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')!.value);
    formData.append(
      'parentCategory',
      this.categoryForm.get('parentCategory')!.value
    );
    console.log(this.categoryForm.get('parentCategory'));
    // Nếu có file ảnh, thêm file vào FormData
    if (this.fileImage) {
      formData.append('image', this.fileImage);
    }
    return formData;
  }

  
  btnBack(){
    this.statusPage = 0;
  }
    

  btnUpdateCategory(id: number | undefined){
    if(this.categoryForm.invalid){
      this.categoryForm.markAllAsTouched();
      return;
    }
    console.log(id);
    if (id !== undefined) {
      console.log(id);
      //Form 
      const formData = this.createFormData();
      // Gọi dịch vụ để cập nhật danh mục
      this.categoryService.updateCategory(id,formData)
        .subscribe({
          next: (response: FlowerCategory) => {
            this.categoryForm.reset();
            this.uploadedImage = '';
            this.toastr.success('Cập nhật danh mục thành công', 'Success', {
              progressBar: true,
            });
            this.flowerCategories.push(response);
            this.dataSource = new MatTableDataSource(this.flowerCategories);
            this.dataSource.sort = this.sort;
            this.categoryService.categoryDataSource.next(this.flowerCategories);
            this.statusPage=0;
          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error('Tạo hoa mới thất bại', 'Error');
            console.error('Error creating product: ', error);
          },
        });
    } else {
      this.toastr.warning(`Vui lòng chọn danh mục`,`WARNING`);
    }
  }
  

  // Hàm để mở dialog
  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(DeleteCategoryComponent, {
      width: '300px',
      data: id
    });

    // Xử lý khi dialog đóng
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.btnDeleteCategory(id); 
      }
    });
  }



  btnDeleteCategory(id: number){
    this.categoryService.deleteCategory(id).subscribe({
      next: (response : FlowerCategory) => {
        this.flowerCategories = this.flowerCategories.filter(category => category.id !== id);
        this.dataSource = new MatTableDataSource(this.flowerCategories);
        this.dataSource.sort = this.sort;
        this.categoryService.categoryDataSource.next(this.flowerCategories);
        this.toastr.success(`Xóa danh mục: ${response.name}  thành công!`);
      },
      error: (err : HttpErrorResponse) => {
        this.toastr.error(`${err.error.error}`, 'ERROR');
        console.log(err)
      },
    });
  }

  //Hàm tìm kiếm
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim().toLowerCase();

    const filtered = this.flowerCategories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );

    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.sort = this.sort;
  }
}
