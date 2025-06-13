import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupFormComponent } from '../../components/signup_form/signup-form.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, SignupFormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  // Array of images for the slideshow
  images: string[] = [
    'images/signup.jpg',
    'images/s.png',
    'images/login.jpg',
    // Add more images when available
  ];
  
  currentImageIndex = 0;
  nextImageIndex = 1;
  currentImage = this.images[0];
  nextImageSrc = this.images[1];
  isTransitioning = false;
  private intervalId: any;
  
  ngOnInit() {
    // Start the slideshow with a 5-second interval
    this.intervalId = setInterval(() => {
      this.changeImage();
    }, 5000);
  }
  
  ngOnDestroy() {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  changeImage() {
    // Start transition effect
    this.isTransitioning = true;
    
    // Calculate next image index
    this.nextImageIndex = (this.currentImageIndex + 1) % this.images.length;
    this.nextImageSrc = this.images[this.nextImageIndex];
    
    // After the transition completes, update current image and reset transition state
    setTimeout(() => {
      this.currentImageIndex = this.nextImageIndex;
      this.currentImage = this.images[this.currentImageIndex];
      
      // Calculate the new next image for the next transition
      this.nextImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.nextImageSrc = this.images[this.nextImageIndex];
      
      // Reset transition state
      this.isTransitioning = false;
    }, 2000); // This now matches the CSS transition duration of 2000ms
  }
}
