import { Component } from '@angular/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatOption } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import {MatSelectModule} from '@angular/material/select';
import { confirmPasswordReset } from '@angular/fire/auth';

interface Gender{
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [    HeaderComponent,
    FooterComponent,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
  MatOption,
FormsModule,
MatSelectModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  selectedValue: string;
  formSignUp : FormGroup;
  
  // Mảng các lựa chọn giới tính
  genders: Gender[] = [
    { value: 'MALE', viewValue: 'Male' },
    { value: 'FEMALE', viewValue: 'Female' },
    { value: 'OTHER', viewValue: 'Other' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService : AuthService
  ) {
    this.formSignUp = this.formBuilder.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    name: ['', Validators.required], 
    accountGender: ['', Validators.required],
    });
    this.selectedValue ='';
  }

  btnSignUp(){
    if(this.formSignUp.invalid){
      this.formSignUp.markAllAsTouched();
      return;
    }

    const email = this.formSignUp.get('email')?.value;
    const password = this.formSignUp.get('password')?.value;
    const confirmPassword = this.formSignUp.get('confirmPassword')?.value;
    const name = this.formSignUp.get('name')?.value;
    const accountGender = this.formSignUp.get('accountGender')?.value;

    if(password != confirmPassword){
      return;
    }

    this.authService.register(email, password, name, accountGender).subscribe(
        {
          next: (response) => {
            this.router.navigate(['/signin']);
            debugger
          },
          error: (error) => {
            console.error('Error during registration:', error);
            debugger
          },
        }
        
    );

  }
}
