import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
        padding: 20px;
      }
      .orders-list {
        margin-top: 20px;
      }
      .order-item {
        padding: 15px;
        border-bottom: 1px solid #eee;
      }
    `,
  ],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  selectedStatus: string = 'all';
  userEmails: { [key: number]: string } = {};

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders =
          this.selectedStatus === 'all'
            ? orders
            : orders.filter((o) => o.status === this.selectedStatus);
        // Load user emails for each order
        this.loadUserEmails();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      },
    });
  }

  loadUserEmails() {
    const userIds = [...new Set(this.orders.map((order) => order.userId))];
    userIds.forEach((userId) => {
      this.authService.getUserById(userId).subscribe({
        next: (user: User) => {
          if (user && user.email) {
            this.userEmails[userId] = user.email;
          }
        },
        error: (error: unknown) => {
          console.error(`Error loading user ${userId}:`, error);
        },
      });
    });
  }

  getUserEmail(userId: number): string {
    return this.userEmails[userId] || 'Loading...';
  }

  updateOrderStatus(
    order: Order,
    newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
      },
      error: (error: unknown) => {
        console.error('Error updating order status:', error);
      },
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}
