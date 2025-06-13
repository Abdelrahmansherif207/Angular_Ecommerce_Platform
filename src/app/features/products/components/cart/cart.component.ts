import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ProductService,
  CartItem,
} from '../../../../core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.productService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.cartTotal = this.productService.getCartTotal();
    });
  }

  updateQuantity(productId: string | number, quantity: number): void {
    if (quantity > 0) {
      this.productService.updateCartItemQuantity(productId, quantity);
    } else {
      this.removeItem(productId);
    }
  }

  removeItem(productId: string | number): void {
    this.productService.removeFromCart(productId);
  }

  clearCart(): void {
    this.productService.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  onQuantityInputChange(event: Event, productId: string | number): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (!isNaN(value) && value > 0) {
      this.updateQuantity(productId, value);
    }
  }
}
