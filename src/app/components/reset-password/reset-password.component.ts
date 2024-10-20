import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    });
  }
}
