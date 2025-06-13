import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Order {
  id: number;
  userId: number;
  products: {
    id: number;
    quantity: number;
    price: number;
    name: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface Statistics {
  sales: {
    daily: {
      [key: string]: {
        orders: number;
        revenue: number;
      };
    };
    monthly: {
      [key: string]: {
        orders: number;
        revenue: number;
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:3000';
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.apiUrl}/orders`)
      .pipe(tap((orders) => this.ordersSubject.next(orders)));
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders?userId=${userId}`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Order> {
    return this.http
      .post<Order>(`${this.apiUrl}/orders`, {
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .pipe(tap(() => this.getOrders().subscribe()));
  }

  updateOrderStatus(
    orderId: number,
    status: Order['status']
  ): Observable<Order> {
    return this.http
      .patch<Order>(`${this.apiUrl}/orders/${orderId}`, {
        status,
        updatedAt: new Date().toISOString(),
      })
      .pipe(tap(() => this.getOrders().subscribe()));
  }

  // Admin Statistics
  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/statistics`);
  }

  getDailyStatistics(
    date: string
  ): Observable<{ orders: number; revenue: number }> {
    return this.getStatistics().pipe(
      map((stats) => stats.sales.daily[date] || { orders: 0, revenue: 0 })
    );
  }

  getMonthlyStatistics(
    month: string
  ): Observable<{ orders: number; revenue: number }> {
    return this.getStatistics().pipe(
      map((stats) => stats.sales.monthly[month] || { orders: 0, revenue: 0 })
    );
  }
}
