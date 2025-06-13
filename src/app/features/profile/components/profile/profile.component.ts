import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  activeTab: 'profile' | 'orders' | 'settings' = 'profile';
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  
  // Sample order history data - would typically come from a service
  orderHistory = [
    {
      id: '#ORD-5289',
      date: '2025-05-15',
      status: 'Delivered',
      total: 259.99,
      items: 3,
      statusClass: 'bg-green-100 text-green-800'
    },
    {
      id: '#ORD-4319',
      date: '2025-04-28',
      status: 'Processing',
      total: 129.50,
      items: 2,
      statusClass: 'bg-blue-100 text-blue-800'
    },
    {
      id: '#ORD-3327',
      date: '2025-03-12',
      status: 'Delivered',
      total: 89.99,
      items: 1,
      statusClass: 'bg-green-100 text-green-800'
    },
    {
      id: '#ORD-2189',
      date: '2025-02-05',
      status: 'Cancelled',
      total: 349.99,
      items: 5,
      statusClass: 'bg-red-100 text-red-800'
    }
  ];
  
  // Saved addresses - would typically come from a service
  addresses = [
    {
      id: 1,
      type: 'Home',
      default: true,
      street: '123 Main Street',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      country: 'United States'
    },
    {
      id: 2,
      type: 'Work',
      default: false,
      street: '456 Office Park',
      city: 'Manhattan',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    }
  ];

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      profilePicture: [''],
      coverImage: [''],
      // Fields matching the user data structure
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.pattern('^[0-9]{10}$')],
      address: [''],
      bio: [''],
      birthdate: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    // Get the current user from AuthService
    this.user = this.authService.currentUserValue;
    
    if (!this.user) {
      // Redirect to login if no user is authenticated
      this.authService.logout();
      return;
    }
    
    // Use firstName and lastName from user data if available
    let firstName = this.user.firstName || '';
    let lastName = this.user.lastName || '';
    
    // Populate the form with user data
    this.profileForm.patchValue({
      email: this.user.email || '',
      profilePicture: this.user.profilePicture || '/images/pp.png',
      firstName: firstName,
      lastName: lastName,
      // Use user values or defaults
      phone: this.user.phone || '5551234567',
      address: this.user.address || '',
      bio: 'Passionate about fashion and technology.',
      birthdate: '1990-01-15'
    });
    
    this.isLoading = false;
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values when canceling edit
      this.loadUserProfile();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;
    this.errorMessage = '';
    
    // In a real app, we'd send the form data to the backend
    // For now, we'll update the local user data
    setTimeout(() => {
      // Update the current user object with the form values
      if (this.user) {
        this.user.firstName = this.profileForm.get('firstName')?.value || this.user.firstName;
        this.user.lastName = this.profileForm.get('lastName')?.value || this.user.lastName;
        this.user.email = this.profileForm.get('email')?.value || this.user.email;
        this.user.phone = this.profileForm.get('phone')?.value || this.user.phone;
        this.user.address = this.profileForm.get('address')?.value || this.user.address;
        this.user.profilePicture = this.profileForm.get('profilePicture')?.value || this.user.profilePicture;
        
        // Update the user in the AuthService (which will update localStorage too)
        this.authService.updateCurrentUser(this.user);
      }
      
      this.isSaving = false;
      this.isEditing = false;
      this.successMessage = 'Profile updated successfully!';
      
      // Clear success message after a few seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  changeTab(tab: 'profile' | 'orders' | 'settings'): void {
    this.activeTab = tab;
  }

  changeProfilePicture(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      // In a real app, we'd upload the file to a server
      // For now, we'll simulate by creating a local URL
      const reader = new FileReader();
      reader.onload = () => {
        const profilePicture = reader.result as string;
        
        // Update the form value
        this.profileForm.patchValue({
          profilePicture: profilePicture
        });
        
        // Immediately update the user object and navbar
        if (this.user) {
          this.user.profilePicture = profilePicture;
          
          // Update the user in the AuthService (which will update localStorage and navbar)
          this.authService.updateCurrentUser(this.user);
        }
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }

  getFormControlError(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['minlength']) {
        return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['pattern']) {
        return 'Please enter a valid format';
      }
    }
    return '';
  }

  handleLogout(): void {
    this.authService.logout();
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/images/pp.png';
  }

  changeCoverImage(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      // In a real app, we'd upload the file to a server
      // For now, we'll simulate by creating a local URL
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({
          coverImage: reader.result as string
        });
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }
}
