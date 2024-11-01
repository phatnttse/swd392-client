import { Component } from '@angular/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {}
