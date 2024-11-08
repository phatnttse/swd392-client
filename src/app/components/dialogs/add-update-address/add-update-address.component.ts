import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AccountAddress,
  AccountAddressResponse,
} from '../../../models/account.model';
import { AccountService } from '../../../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { StatusService } from '../../../services/status.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-update-address',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './add-update-address.component.html',
  styleUrl: './add-update-address.component.scss',
})
export class AddUpdateAddressComponent implements OnInit {
  formAddress: FormGroup; // Form địa chỉ
  valueProvince: any = []; // Danh sách tỉnh
  listProvinces: any = []; // Danh sách tỉnh
  listDistricts: any = []; // Danh sách huyện
  listCommunes: any = []; // Danh sách xã
  selectedProvinceId: string = ''; // Tỉnh được chọn
  type: string = ''; // Loại add hoặc update
  selectedProvince: string = ''; // Tỉnh được chọn
  selectedDistrict: string = ''; // Huyện được chọn
  selectedCommune: string = ''; // Xã được chọn
  address: AccountAddress | null = null; // Địa chỉ

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private statusService: StatusService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA)
    public data: { type: string; address: AccountAddress },
    private dialogRef: MatDialogRef<AddUpdateAddressComponent>
  ) {
    this.formAddress = this.formBuilder.group({
      recipientName: ['', Validators.required],
      streetAddress: ['', Validators.required],
      ward: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
    });
    this.type = data.type;
    this.address = data.address;
  }

  ngOnInit(): void {
    if (this.type === 'UPDATE' && this.address) {
      this.formAddress.patchValue({
        recipientName: this.address.recipientName,
        streetAddress: this.address.streetAddress,
        ward: this.address.ward,
        district: this.address.district,
        province: this.address.province,
        phone: this.address.phoneNumber,
      });
    }
    this.accountService.getProvinces().subscribe({
      next: (response) => {
        this.valueProvince = response;
      },
      complete: () => {
        this.getDetailProvinces();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  btnAddUpdateAddress() {
    debugger;
    if (this.formAddress.invalid) {
      this.formAddress.markAllAsTouched();
      return;
    }

    this.statusService.statusLoadingSpinnerSource.next(true);

    const recipientName = this.formAddress.get('recipientName')?.value;
    const streetAddress = this.formAddress.get('streetAddress')?.value;
    const ward = this.selectedCommune;
    const district = this.selectedDistrict;
    const province = this.selectedProvince;
    const phone = this.formAddress.get('phone')?.value;

    if (this.type === 'ADD') {
      this.accountService
        .addAddress(
          recipientName,
          streetAddress,
          ward,
          district,
          province,
          phone
        )
        .subscribe({
          next: (response: AccountAddressResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.success('Thêm địa chỉ thành công', 'Success', {
              progressBar: true,
            });
            this.formAddress.reset();
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.error(error.error.message, 'Error', {
              progressBar: true,
            });
          },
        });
    } else if (this.type === 'UPDATE') {
      this.accountService
        .updateAddress(
          this.data.address.id,
          recipientName,
          streetAddress,
          ward,
          district,
          province,
          phone
        )
        .subscribe({
          next: (response: AccountAddressResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.success('Cập nhật địa chỉ thành công', 'Success', {
              progressBar: true,
            });
            this.formAddress.reset();
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.error(error.error.message, 'Error', {
              progressBar: true,
            });
          },
        });
    }
  }

  getDetailProvinces() {
    let setProvinces = new Set();
    this.listCommunes.splice(0, this.listCommunes.length);
    this.listDistricts.splice(0, this.listDistricts.length);
    this.valueProvince.forEach((response: any) => {
      if (!setProvinces.has(response.provinceId)) {
        let cloneProvince = {
          provinceName: response.provinceName,
          provinceId: response.provinceId,
        };
        this.listProvinces.push(cloneProvince);
        setProvinces.add(response.provinceId);
      }
    });
  }
  onProvinceChange(provinceId: string) {
    this.selectedProvinceId = provinceId;

    // Reset danh sách huyện và xã
    this.listDistricts.splice(0, this.listDistricts.length);
    this.listCommunes.splice(0, this.listCommunes.length);

    // Tìm tỉnh theo ID và lưu tên vào form
    const selectedProvince = this.valueProvince.find(
      (province: any) => province.provinceId === provinceId
    );
    if (selectedProvince) {
      this.selectedProvince = selectedProvince.provinceName;
    }

    // Lọc danh sách huyện theo tỉnh được chọn
    let setDistricts = new Set();
    this.valueProvince.forEach((response: any) => {
      if (
        response.provinceId === provinceId &&
        !setDistricts.has(response.districtId)
      ) {
        let cloneDistrict = {
          districtName: response.districtName,
          districtId: response.districtId,
        };
        this.listDistricts.push(cloneDistrict);
        setDistricts.add(response.districtId);
      }
    });
  }

  onDistrictChange(districtId: string) {
    // Reset danh sách xã
    this.listCommunes.splice(0, this.listCommunes.length);

    // Tìm quận theo ID và lưu tên vào form
    const selectedDistrict = this.valueProvince.find(
      (district: any) => district.districtId === districtId
    );
    if (selectedDistrict) {
      this.selectedDistrict = selectedDistrict.districtName;
    }

    // Lọc danh sách xã theo huyện được chọn
    this.valueProvince.forEach((response: any) => {
      if (response.districtId === districtId) {
        let cloneCommune = {
          communeName: response.communeName,
          communeId: response.communeId,
        };
        this.listCommunes.push(cloneCommune);
      }
    });
  }

  onWardChange(communeId: string) {
    const selectedCommune = this.valueProvince.find(
      (commune: any) => commune.communeId === communeId
    );
    if (selectedCommune) {
      this.selectedCommune = selectedCommune.communeName;
    }
  }
}
