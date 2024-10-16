import { LocalStoreManager } from './../../../../services/local-storage.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../../../services/category.service';
import { DBkeys } from '../../../../services/db-keys';
import { FlowerCategory } from '../../../../models/category.model';
import { Category } from '../../../../models/flower.model';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-admin-category-management',
  standalone: true,
  imports: [ ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatTooltipModule,
    CommonModule,
    MatPaginator],
  templateUrl: './admin-category-management.component.html',
  styleUrl: './admin-category-management.component.scss'
})
export class AdminCategoryManagementComponent implements OnInit, AfterViewInit{
  @ViewChild(MatSort) sort!: MatSort;
  convertedCategories: any[] = []; // Danh sách danh mục đã chuyển đổi
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayColumns: string[]=[
    "id",
    "name",
    'action'
  ];
  status : number = 0;
  selectedCategory : any;
  constructor(
    private localStorage : LocalStoreManager,
    private categoryService : CategoryService,
    private cdr: ChangeDetectorRef
  ){}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(){
    this.categoryService.convertedCategoryData$.subscribe(
      (categoryData: any) => {
        this.convertedCategories = categoryData;
        this.dataSource = new MatTableDataSource(this.convertedCategories);
        this.dataSource.sort = this.sort;
        console.log(categoryData)
      }
    );
  }

  viewDetailsArray(id: number){
    this.status = 1;
    
  }
}
