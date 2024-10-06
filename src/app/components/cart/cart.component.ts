import { Component } from '@angular/core';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderComponent } from '../../layouts/header/header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {}
