import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { AccountService } from '../../../services/account.service';
import { StatusService } from '../../../services/status.service';
import { ToastrService } from 'ngx-toastr';
import { AccountAddressResponse } from '../../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-delete-address',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatInputModule],
  templateUrl: './delete-address.component.html',
  styleUrl: './delete-address.component.scss',
})
export class DeleteAddressComponent {
  constructor(
    private accountService: AccountService,
    private statusService: StatusService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA)
    public data: { addressId: number },
    private dialogRef: MatDialogRef<DeleteAddressComponent>
  ) {}

  btnDeleteAddress() {
    this.accountService.deleteAddress(this.data.addressId).subscribe({
      next: (response: AccountAddressResponse) => {
        this.dialogRef.close(true);
        this.toastr.success('Xoá địa chỉ thành công', 'Success');
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.message, 'Error');
      },
    });
  }
}
