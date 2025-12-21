import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnInit {
  userForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  userId: string | null = null;
  currentUser: any = null;

  roles = [
    { value: 0, label: 'Usuário', description: 'Acesso básico ao sistema' },
    { value: 1, label: 'Coordenador de Grupo', description: 'Pode criar posts e eventos' },
    { value: 2, label: 'Coordenador Geral', description: 'Pode gerenciar usuários e grupos' },
    { value: 3, label: 'Administrador', description: 'Acesso total ao sistema' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      roleType: [0, Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    });

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          telefone: user.telefone,
          roleType: user.role?.type || 0
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.errorMessage = 'Erro ao carregar usuário';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const password = this.userForm.value.password;
    const confirmPassword = this.userForm.value.confirmPassword;

    if (password && password !== confirmPassword) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData: any = {
      name: this.userForm.value.name,
      email: this.userForm.value.email,
      telefone: this.userForm.value.telefone,
      roleType: this.userForm.value.roleType
    };

    if (password) {
      formData.password = password;
    }

    const request = this.isEditMode && this.userId
      ? this.userService.update(this.userId, formData)
      : this.userService.create(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao salvar usuário';
      }
    });
  }

  canEditRole(): boolean {
    return this.currentUser?.role?.type! >= 2;
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
