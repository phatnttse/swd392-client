import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-delete-flower',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterModule],
  templateUrl: './delete-flower.component.html',
  styleUrl: './delete-flower.component.scss',
})
export class DeleteFlowerComponent {
  flowerId: number = 0; // Id hoa
  constructor(
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private dialogRef: MatDialogRef<DeleteFlowerComponent>
  ) {
    this.flowerId = data;
  }

  btnDeleteFlower() {
    if (this.flowerId > 0) {
      this.productService.deleteFlower(this.flowerId).subscribe({
        next: (response: any) => {
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.dialogRef.close(false);
        },
      });
    }
  }
}
