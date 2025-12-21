import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-success',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Processando login...</p>
      </div>
    </div>
  `
})
export class GoogleSuccess implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        console.error('Erro no login do Google:', error);
        this.router.navigate(['/login'], { 
          queryParams: { error: 'Falha no login com Google' } 
        });
        return;
      }

      if (token) {
        // Salva o token
        localStorage.setItem('token', token);
        
        // Redireciona para o dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login'], { 
          queryParams: { error: 'Token não recebido' } 
        });
      }
    });
  }
}
