import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor() {}

  // trạng thái loading spinner false: tắt xoay, true: bật xoay
  public statusLoadingSpinnerSource = new BehaviorSubject<boolean>(false);
  statusLoadingSpinner$ = this.statusLoadingSpinnerSource.asObservable();

  // Trạng thái tải dữ liệu của app
  public statusLoadingDataAppSource = new BehaviorSubject<boolean>(true);
  statusLoadingDataApp$ = this.statusLoadingDataAppSource.asObservable();

  // Trạng thái ngôn ngữ
  public statusLanguageSource = new BehaviorSubject<any>(null);
  statusLanguage$ = this.statusLanguageSource.asObservable();
}
