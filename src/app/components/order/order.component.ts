import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { OrderService } from '../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserBalanceResponse } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatBadgeModule } from '@angular/material/badge';
import { PaymentMethod } from '../../models/enums';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  FeeShipRequest,
  ParseAddress,
  ParseAddressResponse,
  SuggestAddress,
  SuggestAddressResponse,
} from '../../models/integration.model';
import { debounceTime, filter, firstValueFrom } from 'rxjs';
import { IntegrationService } from '../../services/integration.service';
import { AccountService } from '../../services/account.service';
import { MatCardModule } from '@angular/material/card';
import { StatusService } from '../../services/status.service';
import confetti from 'canvas-confetti';
import { MatDialog } from '@angular/material/dialog';
import { InsufficientBalanceComponent } from '../dialogs/insufficient-balance/insufficient-balance.component';
import { BaseResponse } from '../../models/base.model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatRadioModule,
    MatIconModule,
    RouterModule,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
    MatBadgeModule,
    BreadcrumbComponent,
    MatAutocompleteModule,
    MatCardModule,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  accountBalance: number = 0; // Số dư ví của người dùng
  orderForm: FormGroup; // Form đặt hàng
  listCartItem: CartItem[] = []; // Danh sách sản phẩm trong giỏ hàng
  totalAmount: number = 0; // Tổng tiền cần thanh toán
  subtotalAmount = 0; // Tiền tạm tính
  selectedPaymentMethod: string = ''; // Phương thức thanh toán được chọn
  statusOrder: number = 0; // 0: Chưa đặt hàng, 1: Đặt hàng thành công, 2: Đặt hàng thất bại
  isBalanceInsufficient: boolean = false; // Kiểm tra số dư ví có đủ để thanh toán không
  isDisabledBtn: boolean = false; // Kiểm tra xem nút đặt hàng có bị disable không
  paymentMethods = PaymentMethod; // Enum phuong thuc thanh toan
  suggestAddresses: SuggestAddress[] = []; // Địa chỉ gợi ý
  shippingFee: number = 0; // Phí vận chuyển
  parseAddress: ParseAddress | null = null; // Địa chỉ đã được parse
  street: string = ''; // Tên đường/phố của người nhận hàng hóa
  ward: string = ''; // Tên phường/xã của người nhận hàng hóa
  district: string = ''; // Tên quận/huyện của người nhận hàng hóa
  province: string = ''; // Tên tỉnh/thành phố của người nhận hàng hóa
  pickProvince: string = ''; // Tên tỉnh/thành phố nơi lấy hàng hóa
  pickDistrict: string = ''; // Tên quận/huyện nơi lấy hàng hóa
  pickWard: string = ''; // Tên phường/xã nơi lấy hàng hóa
  pickStreet: string = ''; // Tên đường/phố nơi lấy hàng hóa
  weight: number = 1000; // Cân nặng của gói hàng, đơn vị sử dụng Gram
  value: number = 0; // Giá trị thực của đơn hàng áp dụng để tính phí bảo hiểm, đơn vị sử dụng VNĐ
  transport: string = 'road'; // Phương thức vâng chuyển road ( bộ ) , fly (bay). Nếu phương thức vận chuyển không hợp lệ thì GHTK sẽ tự động nhảy về PTVC mặc định
  deliver_option: string = 'xteam'; // Sử dụng phương thức vận chuyển xfast. Nhận 1 trong 2 giá trị xteam/none
  tags: string[] = []; // Gắn nhãn cho đơn hàng. Truyền giá trị nhãn đơn hàng vào mảng tags
  shippingFees: {
    flowerId: number;
    flowerName: string;
    shippingFee: number;
  }[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService,
    private integrationService: IntegrationService,
    private accountService: AccountService,
    private statusService: StatusService,
    private dialog: MatDialog
  ) {
    this.orderForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g),
        ],
      ],
      deliveryAddress: ['', [Validators.required, Validators.minLength(10)]], //Địa chỉ chi tiết của người nhận hàng, ví dụ: Chung cư CT1, ngõ 58, đường Trần Bình
      note: ['', Validators.maxLength(200)],
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getBalance();

    this.cartService.cartDataSource.subscribe((cartData: CartItem[]) => {
      if (cartData) {
        this.listCartItem = cartData;
      }
    });

    this.cartService.totalAmountSubject.subscribe((amount: number) => {
      this.subtotalAmount = amount;
      this.totalAmount = amount;
      // this.checkBalance();
    });

    this.orderForm
      .get('deliveryAddress')
      ?.valueChanges.pipe(
        debounceTime(500),
        filter((value) => value && value.length >= 20)
      )
      .subscribe(() => {
        this.onAddressChange();
      });
  }

  getBalance() {
    this.accountService.getAccountBalance().subscribe({
      next: (response: UserBalanceResponse) => {
        this.accountBalance = response.balance;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error getting balance:', error);
      },
    });
  }
  placeOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      if (this.selectedPaymentMethod === '') {
        this.toastr.warning(
          'Vui lòng chọn phương thức thanh toán',
          'Đặt hàng thất bại',
          {
            progressBar: true,
          }
        );
      }
      return;
    }
    if (this.totalAmount === 0) {
      this.toastr.warning('Bạn chưa chọn sản phẩm nào', 'Đặt hàng thất bại', {
        progressBar: true,
      });
      return;
    }
    if (this.selectedPaymentMethod === PaymentMethod.WALLET) {
      if (this.accountBalance! < this.totalAmount) {
        this.dialog.open(InsufficientBalanceComponent);
        return;
      }
    }

    this.statusService.statusLoadingSpinnerSource.next(true);
    const buyerName = this.orderForm.get('name')?.value;
    const buyerAddress = this.orderForm.get('deliveryAddress')?.value;
    const buyerPhone = this.orderForm.get('phone')?.value;
    const paymentMethod = this.selectedPaymentMethod;
    const note = this.orderForm.get('note')?.value;
    const orderDetails = this.listCartItem.map((item) => {
      return {
        flowerListingId: item.flowerId,
        quantity: item.quantity,
        price: String(item.flowerPrice),
      };
    });

    if (paymentMethod === PaymentMethod.WALLET) {
      this.orderService
        .orderByWallet(
          buyerName,
          buyerAddress,
          buyerPhone,
          paymentMethod,
          note,
          orderDetails
        )
        .subscribe({
          next: (response: any) => {
            this.cartService.reset();
            this.orderForm.reset();
            this.statusOrder = 1;
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.startConfetti();
          },
          error: (error: HttpErrorResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.error(error.error.message, 'Đặt hàng thất bại', {
              progressBar: true,
              progressAnimation: 'increasing',
              timeOut: 5000,
            });
            this.statusOrder = 2;
          },
        });
    } else if (paymentMethod === PaymentMethod.COD) {
      this.orderService
        .orderByCOD(
          buyerName,
          buyerAddress,
          buyerPhone,
          paymentMethod,
          note,
          orderDetails
        )
        .subscribe({
          next: (response: any) => {
            this.cartService.reset();
            this.orderForm.reset();
            this.statusOrder = 1;
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.startConfetti();
          },
          error: (error: HttpErrorResponse) => {
            this.statusService.statusLoadingSpinnerSource.next(false);
            this.toastr.error(error.error.message, 'Đặt hàng thất bại', {
              progressBar: true,
              progressAnimation: 'increasing',
              timeOut: 5000,
            });
            this.statusOrder = 2;
          },
        });
    }
  }
  // checkBalance(): void {
  //   if (this.accountBalance >= 0 && this.totalAmount) {
  //     this.isBalanceInsufficient = this.accountBalance < this.totalAmount;
  //   }
  // }

  ClearCart() {
    this.cartService.clearCart().subscribe({
      next: (response: BaseResponse<any>) => {
        this.cartService.reset();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  retryOrder() {
    this.statusOrder = 0;
  }

  onAddressChange() {
    const address = this.orderForm.get('deliveryAddress')?.value;
    if (address.length >= 10) {
      this.integrationService.getSuggestAddress(address).subscribe({
        next: (response: SuggestAddressResponse) => {
          if (response.success) {
            this.suggestAddresses = response.data;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error('Error parsing address', 'Error');
          console.error('Address parsing error:', error);
        },
      });
    }
  }

  // Xử lý khi chọn địa chỉ từ gợi ý
  onSelectSuggestAddress(address: string): void {
    this.orderForm.get('deliveryAddress')?.setValue(address);

    this.integrationService.getParseAddress(address).subscribe({
      next: (response: ParseAddressResponse) => {
        if (response.success) {
          this.shippingFee = 0;
          this.shippingFees = [];
          const parsed = response.data;
          this.province = parsed.province.name;
          this.district = parsed.district.name;
          this.ward = parsed.ward.name;
          this.street = parsed.special.name;
          this.calculateShippingFees();
        }
      },

      error: (error: HttpErrorResponse) => {
        this.toastr.error('Lỗi khi phân tích địa chỉ', 'Error');
        console.error('Parse address error:', error);
      },
    });
  }

  // Phương thức tính toán phí vận chuyển
  calculateShippingFees() {
    this.statusService.statusLoadingSpinnerSource.next(true);
    const shippingFeePromises = this.listCartItem.map(async (item) => {
      try {
        const parsedAddress = await firstValueFrom(
          this.integrationService.getParseAddress(item.address)
        );
        if (parsedAddress.success) {
          const parsed = parsedAddress.data;
          const getFeeShipRequest: FeeShipRequest = {
            address: this.orderForm.get('deliveryAddress')?.value,
            province: this.province,
            district: this.district,
            ward: this.ward,
            pick_address: item.address,
            pick_province: parsed.province.name,
            pick_district: parsed.district.name,
            pick_ward: parsed.ward.name,
            weight: this.weight,
            value: this.totalAmount,
            deliver_option: this.deliver_option,
            tags: this.tags,
            transport: this.transport,
          };

          const feeResponse = await firstValueFrom(
            this.integrationService.getFeeShip(getFeeShipRequest)
          );
          if (feeResponse.success) {
            this.shippingFees.push({
              flowerId: item.flowerId,
              flowerName: item.flowerName,
              shippingFee: feeResponse.fee.fee,
            });
          } else {
            this.statusService.statusLoadingSpinnerSource.next(false);
            throw new Error('Failed to calculate shipping fee');
          }
        } else {
          this.statusService.statusLoadingSpinnerSource.next(false);
          throw new Error('Failed to parse address');
        }
      } catch (error) {
        this.statusService.statusLoadingSpinnerSource.next(false);
        console.error('Error calculating shipping fees:', error);
        throw error;
      }
    });

    Promise.all(shippingFeePromises)
      .then(() => {
        this.shippingFee = this.shippingFees.reduce(
          (acc, fee) => acc + fee.shippingFee,
          0
        );
        this.totalAmount += this.shippingFee;
        // this.checkBalance();
        this.statusService.statusLoadingSpinnerSource.next(false);
      })
      .catch((error) => {
        console.error('Error calculating shipping fees:', error);
      });
  }

  // Hàm hiệu ứng confetti
  startConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
  selectPayment(method: string) {
    this.selectedPaymentMethod = method;
  }
}
