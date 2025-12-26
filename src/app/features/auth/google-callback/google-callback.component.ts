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
  successMessage = '';
  registrationToken = '';
  prefillData: { email: string; name: string; photoUrl?: string } | null = null;
  canResendCode = true;
  resendCountdown = 0;

  completeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  showPassword = false;

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    const token = this.route.snapshot.queryParamMap.get('token');
    const registrationToken = this.route.snapshot.queryParamMap.get('registrationToken');
    
    if (error) {
      this.isLoading = false;
      this.errorMessage = error;
      return;
    }

    if (registrationToken) {
      this.isLoading = false;
      this.requiresCompletion = true;
      this.registrationToken = registrationToken;
      
      try {
        const payload = JSON.parse(atob(registrationToken.split('.')[1]));
        this.prefillData = {
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          photoUrl: payload['photo_url']
        };
        this.completeForm.patchValue({ name: this.prefillData.name });
        this.successMessage = 'Código de verificação enviado para o email';
        this.startResendCountdown();
      } catch (e) {
        this.errorMessage = 'Token inválido';
      }
      return;
    }

    if (token) {
      if (token.includes('.') && token.split('.').length === 3) {
        this.isLoading = false;
        this.authService.loginWithToken(token);
        this.router.navigate(['/feed']);
        return;
      }
      
      this.handleGoogleToken(token);
      return;
    }

    this.isLoading = false;
    this.errorMessage = 'Token não encontrado';
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
          
          const message = (response as any).message;
          if (message) {
            this.successMessage = message;
          }
          this.startResendCountdown();
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
    this.successMessage = '';

    const { name, password, verificationCode } = this.completeForm.value;

    this.authService.googleComplete({
      registrationToken: this.registrationToken,
      name,
      password,
      verificationCode
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao completar cadastro';
      }
    });
  }

  resendCode(): void {
    if (!this.canResendCode || !this.prefillData?.email) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendVerificationCode({ email: this.prefillData.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        this.completeForm.get('verificationCode')?.reset();
        this.startResendCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao reenviar código';
      }
    });
  }

  private startResendCountdown(): void {
    this.canResendCode = false;
    this.resendCountdown = 120; // 2 minutos

    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.canResendCode = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  get resendCountdownFormatted(): string {
    const minutes = Math.floor(this.resendCountdown / 60);
    const seconds = this.resendCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
