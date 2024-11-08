import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AccountAddress,
  AccountAddressListResponse,
} from '../../../models/account.model';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AccountService } from '../../../services/account.service';
import { StatusService } from '../../../services/status.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-address',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './select-address.component.html',
  styleUrl: './select-address.component.scss',
})
export class SelectAddressComponent implements OnInit {
  listAddress: AccountAddress[] = [];
  selectedAddress: AccountAddress | null = null;

  constructor(
    private dialogRef: MatDialogRef<SelectAddressComponent>,
    private accountService: AccountService,
    private statusService: StatusService
  ) {}

  ngOnInit(): void {
    this.getAddressByAccount();
  }

  btnSelectAddress() {
    this.dialogRef.close(this.selectedAddress);
  }

  getAddressByAccount() {
    this.statusService.statusLoadingSpinnerSource.next(true);
    this.accountService.getAddressByAccount().subscribe({
      next: (response: AccountAddressListResponse) => {
        this.listAddress = response.data;
        this.statusService.statusLoadingSpinnerSource.next(false);
      },
      error: (error: HttpErrorResponse) => {
        this.statusService.statusLoadingSpinnerSource.next(false);
      },
    });
  }
}
