import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../shared/models/product.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../../../shared/constants/image-constants';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
        padding: 20px;
      }
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }
      .product-form {
        max-width: 500px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  editingProduct: Partial<Product> | null = null;
  isLoading = false;
  error: string | null = null;
  productForm: FormGroup;
  showProductForm = false;
  categories = ['Electronics', 'Fashion', 'Furniture', 'Gaming'];
  searchQuery = '';

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.productForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: ['', Validators.required],
    });
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl,
    });
    this.showProductForm = true;
  }

  createProduct(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const productData = {
        ...this.productForm.value,
        createdAt: new Date().toISOString(),
      };

      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.loadProducts();
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to create product';
          this.isLoading = false;
          console.error('Error creating product:', err);
        },
      });
    }
  }

  updateProduct(): void {
    if (this.productForm.valid && this.editingProduct?.id) {
      this.isLoading = true;
      const productData = this.productForm.value;

      this.productService
        .updateProduct(this.editingProduct.id, productData)
        .subscribe({
          next: () => {
            this.loadProducts();
            this.cancelEdit();
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Failed to update product';
            this.isLoading = false;
            console.error('Error updating product:', err);
          },
        });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete product';
          this.isLoading = false;
          console.error('Error deleting product:', err);
        },
      });
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log(products);
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.isLoading = false;
        console.error('Error loading products:', err);
      },
    });
  }

  searchProducts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = this.products;
    } else {
      const query = this.searchQuery.trim().toLowerCase();
      this.filteredProducts = this.products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
  }

  cancelEdit(): void {
    this.editingProduct = null;
    this.productForm.reset();
    this.showProductForm = false;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = DEFAULT_PRODUCT_IMAGE;
  }
}
