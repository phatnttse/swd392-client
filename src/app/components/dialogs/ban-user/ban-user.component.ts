import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { UserStatus } from '../../../models/enums';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ban-user',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterModule],
  templateUrl: './ban-user.component.html',
  styleUrl: './ban-user.component.scss'
})
export class BanUserComponent {
  // Thông tin người dùng cần cập nhật
  name: string = '';
  phone: string = '';
  gender: string = '';
  id: number = 0;

  constructor(
    private userService: AccountService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, name: string, phone: string, gender: string},
    private dialogRef: MatDialogRef<BanUserComponent>
  ) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.gender = data.gender;
  }

  // Hàm xử lý cập nhật trạng thái người dùng
  btnUpdateStatusUser() {
    if (this.id > 0) {
      this.userService.updateStatusUser(this.id, this.name, this.phone, this.gender, UserStatus.BAN)
        .subscribe({
          next: (response: any) => {
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Cập nhật trạng thái thất bại', error);
            this.dialogRef.close(false); 
          }
        });
    }
  }
}