import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../../services/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-category',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterModule],
  templateUrl: './delete-category.component.html',
  styleUrl: './delete-category.component.scss'
})
export class DeleteCategoryComponent {
  categoryId: number = 0; // Id hoa
  constructor(
    private categoryService: CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private dialogRef: MatDialogRef<DeleteCategoryComponent>,
    private toatrs : ToastrService
  ) {
    this.categoryId = data;
  }

  btnDeleteFlower() {
    if (this.categoryId > 0) {
      this.categoryService.deleteCategory(this.categoryId).subscribe({
        next: (response: any) => {
          this.dialogRef.close(true);
          this.toatrs.success('Xóa danh mục thành công', 'Xóa thành công');
        },
        error: (error: HttpErrorResponse) => {
          this.dialogRef.close(false);
        },
      });
    }
  }
}
