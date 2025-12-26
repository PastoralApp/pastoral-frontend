import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmationConfig } from './confirmation-modal.component';

export interface ConfirmationRequest {
  config: ConfirmationConfig;
  resolve: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationRequest$ = new Subject<ConfirmationRequest>();

  get requests$(): Observable<ConfirmationRequest> {
    return this.confirmationRequest$.asObservable();
  }

 
  confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'fas fa-trash-alt'
    });
  }

  confirmUpdate(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmar Atualização',
      message: `Deseja salvar as alterações em ${itemName}?`,
      confirmText: 'Sim, salvar',
      cancelText: 'Cancelar',
      type: 'primary',
      icon: 'fas fa-save'
    });
  }
  confirmPublish(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmar Publicação',
      message: `Deseja publicar ${itemName}?`,
      confirmText: 'Sim, publicar',
      cancelText: 'Cancelar',
      type: 'primary',
      icon: 'fas fa-paper-plane'
    });
  }

  warning(title: string, message: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'Entendi',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: 'fas fa-exclamation-triangle'
    });
  }

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationRequest$.next({ config, resolve });
    });
  }
}
