import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ConfirmationModalComponent {
  @Input() config: ConfirmationConfig = {
    title: 'Confirmação',
    message: 'Deseja continuar?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'primary'
  };

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
