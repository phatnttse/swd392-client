import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { UserAccount } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatLabel,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userAccount: UserAccount | null = null;
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // Nếu cần
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      gender: [''], // Nếu cần
      role: [''], // Nếu cần
      avatar: [''], // Nếu cần
      balance: [0], // Nếu cần
      externalAuthType: [''], // Nếu cần
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userAccount = this.authService.currentUser;
    if (this.userAccount) {
      this.profileForm.patchValue({
        name: this.userAccount.name,
        email: this.userAccount.email,
        phone: this.userAccount.phone || '',
        gender: this.userAccount.gender,
        role: this.userAccount.role,
        avatar: this.userAccount.avatar,
        balance: this.userAccount.balance,
        externalAuthType: this.userAccount.externalAuthType,
      });
    } else {
      console.warn('No account found');
    }
  }
}
