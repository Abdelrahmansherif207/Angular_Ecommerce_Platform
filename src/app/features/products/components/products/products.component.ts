import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../shared/models/product.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { DEFAULT_PRODUCT_IMAGE } from '../../../../shared/constants/image-constants';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  successMessage: string | null = null;

  // Make Math available to the template
  Math = Math;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 1;
  pageSizeOptions: number[] = [6, 9, 12, 24];

  // Sorting properties
  sortBy: 'name' | 'price' | 'newest' = 'newest';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.extractCategories();
        this.applySorting();
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        console.error('Error loading products:', err);
      },
    });
  }

  extractCategories(): void {
    // Extract unique categories from products
    this.categories = [
      ...new Set(this.products.map((product) => product.category)),
    ];
  }

  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filterByCategory();
      return;
    }

    const term = this.searchTerm.toLowerCase();

    // If we have a category selected, filter within that category
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(
        (p) =>
          p.category === this.selectedCategory &&
          (p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term))
      );
    } else {
      // Otherwise search across all products
      this.filteredProducts = this.products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    this.applySorting();
    this.updatePagination();
  }

  filterByCategory(): void {
    if (!this.selectedCategory) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        (p) => p.category === this.selectedCategory
      );

      // If there's also a search term, apply that filter too
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        this.filteredProducts = this.filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );
      }
    }

    this.applySorting();
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredProducts = this.products;
    this.currentPage = 1;
    this.applySorting();
    this.updatePagination();
  }
  addToCart(product: Product): void {
    this.productService.addToCart(product, 1).subscribe(() => {
      this.successMessage = `${product.name} added to cart!`;
      setTimeout(() => (this.successMessage = null), 2000);
    });
  }
  viewProductDetails(productId: string | number): void {
    this.router.navigate(['/products', productId]);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = DEFAULT_PRODUCT_IMAGE;
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredProducts.length
    );
    this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
      // Scroll to top of products section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.updatePagination();
  }
  // Sorting methods
  applySorting(): void {
    switch (this.sortBy) {
      case 'name':
        this.filteredProducts.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        break;
      case 'price':
        this.filteredProducts.sort((a, b) => {
          const comparison = a.price - b.price;
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          }
          // Fall back to string comparison of IDs
          const aStr = String(a.id);
          const bStr = String(b.id);
          return this.sortDirection === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        });
        break;
    }
    this.updateDisplayedProducts();
  }

  changeSorting(sortOption: 'name' | 'price' | 'newest'): void {
    if (this.sortBy === sortOption) {
      // Toggle direction if same sort option is selected
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortOption;
      // Default to ascending for name, descending for others
      this.sortDirection = sortOption === 'name' ? 'asc' : 'desc';
    }
    this.applySorting();
  }

  // Helper method to get page array for pagination controls
  getPagesArray(): number[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    // Show first, last, current, and pages around current
    const pages: number[] = [1];

    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    if (startPage > 2) {
      pages.push(-1); // Represents ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages - 1) {
      pages.push(-1); // Represents ellipsis
    }

    pages.push(this.totalPages);

    return pages;
  }
}
