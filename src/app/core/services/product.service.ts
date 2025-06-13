import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../../shared/models/product.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../shared/constants/image-constants';

export interface CartItem {
  productId: string | number;
  quantity: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

  public products$ = this.productsSubject.asObservable();
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
    this.loadCartFromLocalStorage();
  }

  private loadProducts() {
    this.http
      .get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        map((products) =>
          products.map((product) => this.processProduct(product))
        )
      )
      .subscribe((products) => this.productsSubject.next(products));
  }

  private processProduct(product: Product): Product {
    return {
      ...product,
      inStock: product.stock > 0,
    };
  }

  private loadCartFromLocalStorage() {
    const cartKey = 'userCart';
    const cartRaw = localStorage.getItem(cartKey);
    if (cartRaw) {
      const items: CartItem[] = JSON.parse(cartRaw);
      const productIds = items.map((item) => item.productId);

      this.http
        .get<Product[]>(`${this.apiUrl}/products?id=${productIds.join(',')}`)
        .pipe(
          map((products) =>
            items.map((item) => ({
              ...item,
              product: products.find((p) => p.id === item.productId),
            }))
          )
        )
        .subscribe((cartItems) => this.cartItemsSubject.next(cartItems));
    }
  }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        map((products) =>
          products.map((product) => this.processProduct(product))
        )
      );
  }

  getProduct(id: string | number): Observable<Product> {
    return this.http
      .get<Product>(`${this.apiUrl}/products/${id}`)
      .pipe(map((product) => this.processProduct(product)));
  }

  addToCart(product: Product, quantity: number = 1): Observable<void> {
    const cartKey = 'userCart';
    let cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        product,
        quantity,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.cartItemsSubject.next(cart);
    return of(void 0);
  }

  updateCartItemQuantity(productId: string | number, quantity: number): void {
    const cartKey = 'userCart';
    let cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');

    cart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.cartItemsSubject.next(cart);
  }

  removeFromCart(productId: string | number): void {
    const cartKey = 'userCart';
    let cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');

    cart = cart.filter((item) => item.productId !== productId);

    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.cartItemsSubject.next(cart);
  }

  clearCart(): void {
    const cartKey = 'userCart';
    localStorage.removeItem(cartKey);
    this.cartItemsSubject.next([]);
  }

  getCartTotal(): number {
    const items = this.cartItemsSubject.value;
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?q=${query}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products?category=${category}`
    );
  }

  // Admin CRUD Operations
  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product).pipe(
      tap(() => {
        this.loadProducts(); // Refresh the products list
      })
    );
  }

  updateProduct(
    id: string | number,
    product: Partial<Product>
  ): Observable<Product> {
    return this.http
      .patch<Product>(`${this.apiUrl}/products/${id}`, product)
      .pipe(
        tap(() => {
          this.loadProducts(); // Refresh the products list
        })
      );
  }

  deleteProduct(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(
      tap(() => {
        this.loadProducts(); // Refresh the products list
      })
    );
  }
}
