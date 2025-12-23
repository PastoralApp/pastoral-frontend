import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './google-callback.component.html',
  styleUrl: './google-callback.component.scss'
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = true;
  requiresCompletion = false;
  errorMessage = '';
  registrationToken = '';
  prefillData: { email: string; name: string; photoUrl?: string } | null = null;

  completeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  showPassword = false;

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (error) {
      this.isLoading = false;
      this.errorMessage = error;
      return;
    }

    if (token) {
      this.handleGoogleToken(token);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Token não encontrado';
    }
  }

  handleGoogleToken(idToken: string): void {
    this.authService.googleLogin({ idToken }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.requiresCompletion) {
          this.requiresCompletion = true;
          this.registrationToken = response.registrationToken;
          this.prefillData = response.prefill;
          this.completeForm.patchValue({ name: response.prefill.name });
        } else {
          this.router.navigate(['/feed']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao fazer login com Google';
      }
    });
  }

  onCompleteSubmit(): void {
    if (this.completeForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, password } = this.completeForm.value;

    this.authService.googleComplete({
      registrationToken: this.registrationToken,
      name,
      password
    }).subscribe({
      next: () => {
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao completar cadastro';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
