import { BanUserComponent } from './../../../dialogs/ban-user/ban-user.component';
import {
  CommonModule
} from '@angular/common';
import {
  Component,
  ViewChild
} from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatFormFieldModule,
  MatLabel
} from '@angular/material/form-field';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {
  MatTabsModule
} from '@angular/material/tabs';
import {
  RouterModule
} from '@angular/router';
import {
  AccountService
} from '../../../../services/account.service';
import {
  AccountPaginate,
  UserAccount,
  UserAccountPaginatedResponse
} from '../../../../models/account.model';
import {
  user
} from '@angular/fire/auth';
import {
  MatSort,
  MatSortHeader,
  MatSortModule
} from '@angular/material/sort';
import {
  HttpErrorResponse
} from '@angular/common/http';
import {
  Gender,
  Role,
  UserStatus
} from '../../../../models/enums';
import { TranslateModule } from '@ngx-translate/core';
import { Toast, ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { UnbanUserComponent } from '../../../dialogs/unban-user/unban-user.component';

@Component({
  selector: 'app-admin-user-management',
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
    MatLabel,
    MatSortModule,
    TranslateModule
  ],
  templateUrl: './admin-user-management.component.html',
  styleUrl: './admin-user-management.component.scss'
})
export class AdminUserManagementComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource < UserAccount > = new MatTableDataSource < UserAccount > ();
  listUser ? : UserAccount[] = [];
  userAccount ?: UserAccount;
  currentPage: number = 0;
  searchString: string = ''; // Chuỗi tìm kiếm
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 8; // Số lượng sản phẩm trên mỗi trang
  numberOfElements: number = 0; // Số lượng sản phẩm hiện tại
  totalElements: number = 0; // Tổng số lượng sản phẩm
  visiblePages: number[] = []; // Các trang hiển thị
  roleName: Role[]; // Danh sách id danh mục
  statusPage: number = 0; 
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'gender',
    'role',
    'status',
    'action',
  ];

  constructor(
    private accountService: AccountService,
    private toastr : ToastrService,
    public dialog: MatDialog

  ) {
    this.roleName = [Role.ADMIN, Role.MANAGER, Role.USER]
  }

  ngOnInit(): void {
    this.getUsers(
      this.searchString,
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.roleName
    );
    this.dataSource.sort = this.sort;
  }

  getUsers(
    searchString: string,
    order: string,
    sortBy: string,
    pageNumber: number,
    pageSize: number,
    roleName: Role[]
  ) {
    this.accountService.getUsers(
      searchString,
      order,
      sortBy,
      this.currentPage,
      pageSize,
      roleName
    ).subscribe({
      next:(response: UserAccountPaginatedResponse) => {
        this.listUser = response.data.content;
        this.dataSource = new MatTableDataSource(this.listUser);
        this.dataSource.sort = this.sort;
        this.pageNumber = response.data.pageNumber || 0;
        this.pageSize = response.data.pageSize;
        this.totalPages = response.data.totalPages;
        this.numberOfElements = response.data.numberOfElements;
        this.totalElements = response.data.totalElements;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching users:', error);
      },
    });
  }


  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages + 1, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  trackByIndex(index: number): number {
    return index; // Trả về chỉ số của phần tử
  }

  btnChangeStatusPage(status: number, userAccount ? : UserAccount) {
    this.statusPage = status;
    if (userAccount) {
      this.userAccount = userAccount;
    }
  }
  btnBack(){
    this.statusPage = 0;
  }

  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.getUsers(
      this.searchString,
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.roleName
    );
  }

  openBanDialog(id: number, phone: string, gender: string, name: string): void {
    const dialogRef = this.dialog.open(BanUserComponent, {
      width: '300px',
      data: {id, name, phone, gender}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toastr.success(`Chặn thành công tài khoản ID: ${id}`, `Thành công`);
        this.ngOnInit();
      } else{
        this.toastr.warning(`Đã hủy việc chặn tài khoản ID: ${id}`, `Thông báo`);
      }
    });
  }

  openUnbanDialog(id: number, phone: string, gender: string, name: string): void{
    const dialogRef = this.dialog.open(UnbanUserComponent, {
      width: '300px',
      data: {id, name, phone, gender}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toastr.success(`Đã mở khóa tài khoản ID: ${id}`, `Thành công`);
        this.ngOnInit();
      } else{
        this.toastr.warning(`Đã hủy việc mở khóa tài khoản ID: ${id}`, `Thông báo`);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  btnUpdateUserStatus(id: number, phone: string, gender: string, name: string): void {
    this.accountService.updateStatusUser(id, name, phone, gender, UserStatus.BAN).subscribe({
      next: (response) => {
        this.toastr.warning(`Chặn thành công tài khoản ID: ${response.data.id}`);
        this.ngOnInit();
        console.log('Updated User:', response);
      },
      error: (error) => {
        this.toastr.error('Cập nhật trạng thái không thành công:', 'Lỗi');
        console.error('Error updating user status:', error);
      }
    });
  }

  btnUnbanUserStatus(id: number, phone: string, gender: string, name: string): void {
    this.accountService.updateStatusUser(id, name, phone, gender, UserStatus.VERIFIED).subscribe({
      next: (response) => {
        this.toastr.success(`Gỡ chặn thành công tài khoản ID: ${response.data.id}`,`Thành công`);
        this.ngOnInit();
      },
      error: (error) => {
        this.toastr.error('Gỡ chặn tài khoản không thành công:', 'Lỗi');
        console.error('Error updating user status:', error);
      }
    });
  }
}
