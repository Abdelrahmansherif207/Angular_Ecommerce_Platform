import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../shared/models/product.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../shared/constants/image-constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  promotionalProducts: Product[] = [];
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  isLoading = true;
  error: string | null = null;
  currentSlide = 0;

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    // Auto-advance carousel every 5 seconds
    setInterval(() => this.nextSlide(), 5000);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Simulate promotional products (in a real app, this would come from backend)
        this.promotionalProducts = products.slice(0, 5).map((p) => ({
          ...p,
          // Add a discount for promotional items (20-50% off)
          price: p.price * (1 - (Math.floor(Math.random() * 30) + 20) / 100),
        }));

        // Featured products (different from promotional)
        this.featuredProducts = products.slice(5, 9);

        // New arrivals
        this.newArrivals = products.slice(9, 13);

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
        console.error('Error loading products:', err);
      },
    });
  }

  prevSlide(): void {
    this.currentSlide =
      this.currentSlide === 0
        ? this.promotionalProducts.length - 1
        : this.currentSlide - 1;
  }

  nextSlide(): void {
    this.currentSlide =
      this.currentSlide === this.promotionalProducts.length - 1
        ? 0
        : this.currentSlide + 1;
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = DEFAULT_PRODUCT_IMAGE;
  }
}
