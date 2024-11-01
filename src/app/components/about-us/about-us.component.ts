import { Component } from '@angular/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
})
export class AboutUsComponent {}
