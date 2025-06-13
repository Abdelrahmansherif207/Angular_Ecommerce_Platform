// signup.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FontAwesomeModule],
})
export class SignupFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInputControl') fileInputControl!: ElementRef;

  signupForm: FormGroup;
  currentStep = 1;
  totalSteps = 3; // We'll divide 6 inputs into 3 steps of 2 inputs each

  // Profile picture properties
  profileImageUrl: string = 'images/pp.png';
  isUploading = false;
  uploadError: string | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  // Error message for request
  requestError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      // Profile Picture (will be handled separately)
      profilePicture: [null],

      // Step 1
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],

      // Step 2
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],

      // Step 3
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],

      // Role field
      role: ['user', Validators.required], // Add role field, default to 'user'
    });
  }

  get step1Controls() {
    return {
      email: this.signupForm.get('email'),
      password: this.signupForm.get('password'),
    };
  }

  get step2Controls() {
    return {
      firstName: this.signupForm.get('firstName'),
      lastName: this.signupForm.get('lastName'),
    };
  }

  get step3Controls() {
    return {
      phone: this.signupForm.get('phone'),
      address: this.signupForm.get('address'),
    };
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.currentStep--;
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      return !!(
        this.step1Controls.email?.valid && this.step1Controls.password?.valid
      );
    } else if (this.currentStep === 2) {
      return !!(
        this.step2Controls.firstName?.valid &&
        this.step2Controls.lastName?.valid
      );
    }
    return true; // Default to true if not step 1 or 2
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.uploadError =
        'Invalid file type. Please upload an image (JPEG, PNG, GIF).';
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.uploadError = 'File is too large. Maximum size is 5MB.';
      return;
    }

    this.uploadError = null;
    this.isUploading = true;

    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImageUrl = e.target.result;
      this.isUploading = false;

      // Update the form control with the file
      this.signupForm.patchValue({
        profilePicture: file,
      });
      this.signupForm.get('profilePicture')?.updateValueAndValidity();
    };

    reader.onerror = () => {
      this.uploadError = 'Error reading file. Please try again.';
      this.isUploading = false;
    };

    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onSubmit() {
    if (this.signupForm.valid) {
      // For JSON auth server, we need to create a regular JSON object
      const userData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        firstName: this.signupForm.value.firstName,
        lastName: this.signupForm.value.lastName,
        phone: this.signupForm.value.phone,
        address: this.signupForm.value.address,
        role: this.signupForm.value.role, // Include role
      };

      // Get the selected file from the fileInput reference if it exists
      const fileInput = this.fileInput?.nativeElement as HTMLInputElement;
      const selectedFile = fileInput?.files?.[0];

      // If we have a file, we'd typically handle it differently
      // (most JSON servers don't handle file uploads directly)
      if (selectedFile) {
        console.log('File selected:', selectedFile.name);
        // Note: For a real implementation with file uploads, you'd need a separate file upload endpoint
        // or use a service like Cloudinary/AWS S3 and store the URL
      }

      // Log the data for debugging
      console.log('Registration data:', userData);

      // Submit registration data to the API
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          // Redirect to login page
          this.router.navigate(['/login']);
          this.requestError = null;
        },
        error: (error) => {
          // Try to extract a meaningful error message from the API response
          let message = 'Registration failed. Please try again.';
          if (error && error.error) {
            if (typeof error.error === 'string') {
              message = error.error;
            } else if (error.error.message) {
              message = error.error.message;
            } else if (error.error.error) {
              message = error.error.error;
            }
          }
          this.requestError = message;
        },
      });
    }
  }
}
