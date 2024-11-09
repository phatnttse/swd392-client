import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../../services/notification.service';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '../../../../models/notification.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DestinationScreenEnum, NotificationType } from '../../../../models/enums';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-notification-management',
  standalone: true,
  imports: [MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    CommonModule,
    RouterModule,
    TranslateModule,
    MatLabel,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './admin-notification-management.component.html',
  styleUrl: './admin-notification-management.component.scss'
})
export class AdminNotificationManagementComponent {
  notifications: Notification[] = []; // Lưu trữ danh sách thông báo
  notificationForm: FormGroup;
  dataSource: MatTableDataSource<Notification> = new MatTableDataSource<Notification>();
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['id','title', 'message', 'type', 'actions'];
  status: number = 0;
  notificationEnum = Object.values(NotificationType);  // Lấy tất cả các giá trị enum NotificationType
  destinationEnum = Object.values(DestinationScreenEnum);  // Lấy tất cả các giá trị enum DestinationScreenEnum
  selectedNotificationType: string | null = null; // Biến để lưu giá trị được chọn
  selectedNotificationDestinaion: string | null = null; // Biến để lưu giá trị được chọn

  constructor(
    private notificationService: NotificationService, 
    private fb: FormBuilder, 
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.notificationForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.maxLength(500)]],
      type: ['', Validators.required], 
      destinationScreen: ['', Validators.required], 
      scheduledTime: [null], 
    });
  }

  ngOnInit(){
    // Gọi phương thức lấy tất cả thông báo
    this.notificationService.notification$.subscribe(
      (response: Notification[]) => {
        this.notifications = response;
        this.dataSource = new MatTableDataSource(this.notifications);
        this.dataSource.sort = this.sort;
        console.log(response)
      }
    );
  }

  onPageChange(statusPage: number){
    this.status = statusPage;
    this.cdRef.detectChanges();
  }

  btnAddNewNotification(){
    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      return;
    }
      
      //Form 
      const title = this.notificationForm.get('title')?.value;
      const message = this.notificationForm.get('message')?.value;
      const type = this.notificationForm.get('type')?.value;
      const destinationScreen = this.notificationForm.get('destinationScreen')?.value;
      const scheduledTime = this.notificationForm.get('scheduledTime')?.value;

      // Gọi service để lưu danh mục mới vào database
      this.notificationService.addNewNotification(title, message, type, destinationScreen, scheduledTime).subscribe(
        {
          next: (response: Notification) => {
            this.notificationForm.reset();
            this.toastr.success('Tạo thông báo mới thành công', 'Success', {
              progressBar: true,
            });
            this.notifications.push(response);
            this.dataSource = new MatTableDataSource(this.notifications);
            this.dataSource.sort = this.sort;
            this.notificationService.notificationDataSource.next(this.notifications);
            this.status = 0;
          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error('Tạo thông báo mới thất bại', 'Error');
            console.error('Error creating product: ', error);
          },
        }
       );
  }

  trackByFn(index: number, destination: string): string {
    return destination;
  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.notificationForm.get('title')!.value);
    formData.append('message', this.notificationForm.get('message')!.value);
    formData.append('type',this.notificationForm.get('type')!.value);
    formData.append('destinationScreen',this.notificationForm.get('destinationScreen')!.value);
    formData.append(
      'scheduledTime',
      this.notificationForm.get('scheduledTime')!.value
    );
    console.log(formData);
    return formData;
  }

}
