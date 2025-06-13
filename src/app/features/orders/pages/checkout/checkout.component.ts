import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  user: User | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      payment: ['credit', Validators.required],
    });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.checkoutForm.patchValue({
        name: `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim(),
        address: this.user.address || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
      });
    }
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      // Place order logic here
      console.log('Order placed:', this.checkoutForm.value);
    }
  }
}
