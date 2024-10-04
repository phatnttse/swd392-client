import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor() {}

  // trạng thái loading spinner 0: tắt xoay, 1: bật xoay
  public statusLoadingSpinnerSource = new BehaviorSubject<any>(1);
  statusLoadingSpinner$ = this.statusLoadingSpinnerSource.asObservable();
}
