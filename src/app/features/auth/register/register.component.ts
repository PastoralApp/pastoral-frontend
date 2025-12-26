import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

enum RegistrationStep {
  EMAIL_STEP = 'email',
  CODE_STEP = 'code',
  PASSWORD_STEP = 'password'
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentStep = RegistrationStep.EMAIL_STEP;
  RegistrationStep = RegistrationStep;

  emailForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  codeForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  canResendCode = true;
  resendCountdown = 0;

  email = '';
  name = '';

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    }
    return null;
  }

  onEmailSubmit(): void {
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email } = this.emailForm.value;
    this.name = name;
    this.email = email;

    console.log('Enviando código para:', email);

    this.authService.sendVerificationCode({ name, email }).subscribe({
      next: (response) => {
        console.log('Resposta recebida:', response);
        this.isLoading = false;
        this.successMessage = response.message;
        this.currentStep = RegistrationStep.CODE_STEP;
        this.startResendCountdown();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erro ao enviar código:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao enviar código';
        this.cdr.detectChanges();
      }
    });
  }

  onCodeSubmit(): void {
    if (this.codeForm.invalid) return;

    this.currentStep = RegistrationStep.PASSWORD_STEP;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { password } = this.passwordForm.value;
    const { code } = this.codeForm.value;

    this.authService.register({
      name: this.name,
      email: this.email,
      password,
      verificationCode: code
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao criar conta';
        if (this.errorMessage.toLowerCase().includes('código') || 
            this.errorMessage.toLowerCase().includes('verificação') ||
            this.errorMessage.toLowerCase().includes('expirado')) {
          this.currentStep = RegistrationStep.CODE_STEP;
        }
      }
    });
  }

  resendCode(): void {
    if (!this.canResendCode) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendVerificationCode({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        this.codeForm.reset();
        this.startResendCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao reenviar código';
      }
    });
  }

  goBackToEmail(): void {
    this.currentStep = RegistrationStep.EMAIL_STEP;
    this.codeForm.reset();
    this.passwordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBackToCode(): void {
    this.currentStep = RegistrationStep.CODE_STEP;
    this.passwordForm.reset();
    this.errorMessage = '';
  }

  loginWithGoogle(): void {
    window.location.href = this.authService.getGoogleLoginUrl();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private startResendCountdown(): void {
    this.canResendCode = false;
    this.resendCountdown = 120; 

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
}
