import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: string | number): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (data: Product) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        this.error = 'Product not found or an error occurred.';
        this.isLoading = false;
        console.error('Error loading product:', err);
      },
    });
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.productService
        .addToCart(this.product, this.quantity)
        .subscribe(() => {
          // Optional: Show success message or navigate to cart
          this.quantity = 1; // Reset quantity after adding to cart
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
