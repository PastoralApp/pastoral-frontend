import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{toast.type}}">
          <div class="toast-content">
            <span class="toast-icon material-icons">
              @switch (toast.type) {
                @case ('success') { check_circle }
                @case ('error') { error }
                @case ('warning') { warning }
                @case ('info') { info }
                @default { notifications }
              }
            </span>
            <span class="toast-message">{{ toast.message }}</span>
            <button class="toast-close" (click)="toastService.remove(toast.id)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ToastComponent {
  toastService = inject(ToastService);
}