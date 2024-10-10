import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { AddBalanceResponse } from '../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent {
  formTopUp: FormGroup; // Form nạp tiền

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private accountService: AccountService,
    public authService: AuthService
  ) {
    this.formTopUp = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(20000)]],
    });
  }

  // Nạp tiền vào ví
  btnTopUp() {
    if (this.formTopUp.invalid) {
      this.formTopUp.markAllAsTouched();
      return;
    }
    const amount = this.formTopUp.get('amount')?.value;

    this.accountService.addBalance(amount).subscribe({
      next: (response: AddBalanceResponse) => {
        window.location.href = response.checkoutUrl;
        this.formTopUp.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.message, 'Error');
      },
    });
  }
}
