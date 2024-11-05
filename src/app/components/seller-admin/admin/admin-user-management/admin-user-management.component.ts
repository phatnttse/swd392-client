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
  Role
} from '../../../../models/enums';
import { TranslateModule } from '@ngx-translate/core';

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
    'action',
  ];

  constructor(
    private accountService: AccountService
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
        console.log('API response:', response.data.content); 

         // Ghi log trước khi gán giá trị
         console.log('Number of users:', response.data.numberOfElements);
         console.log('Total pages:', response.data.totalPages);
         console.log('Current page:', this.currentPage);

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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
