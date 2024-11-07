import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-insufficient-balance',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterModule],
  templateUrl: './insufficient-balance.component.html',
  styleUrl: './insufficient-balance.component.scss',
})
export class InsufficientBalanceComponent {}
