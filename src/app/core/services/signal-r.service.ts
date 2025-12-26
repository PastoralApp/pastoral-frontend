import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Notificacao } from '../models/notificacao.model';
import { ToastService } from '../../shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private toastService = inject(ToastService);
  private hubConnection: signalR.HubConnection | null = null;
  novaNotificacao = signal<Notificacao | null>(null);
  isConnected = signal(false);

  constructor() {}

  private setupConnection(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token não encontrado. SignalR não será inicializado.');
      return;
    }
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/notificacao`, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('NovaNotificacao', (notificacao: Notificacao) => {
      console.log('Nova notificação recebida:', notificacao);
      this.novaNotificacao.set(notificacao);
      this.toastService.info(`${notificacao.titulo}: ${notificacao.mensagem}`);
    });

    this.hubConnection.on('TestResponse', (message: string) => {
      console.log('Teste de conexão:', message);
      this.toastService.success('Conectado ao servidor de notificações');
    });

    this.hubConnection.onreconnecting(() => {
      console.log('Reconectando ao hub...');
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconectado ao hub');
      this.isConnected.set(true);
    });

    this.hubConnection.onclose(() => {
      console.log('Desconectado do hub');
      this.isConnected.set(false);
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.hubConnection) {
        this.setupConnection();
      }

      if (!this.hubConnection) {
        reject('Hub não foi inicializado. Verifique se o token está presente.');
        return;
      }

      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.isConnected.set(true);
        resolve();
        return;
      }

      this.hubConnection
        .start()
        .then(() => {
          console.log('Conectado ao hub de notificações');
          this.isConnected.set(true);
          resolve();
        })
        .catch((err: unknown) => {
          console.error('Erro ao conectar ao hub:', err);
          reject(err);
        });
    });
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.hubConnection) {
        resolve();
        return;
      }

      this.hubConnection
        .stop()
        .then(() => {
          console.log('Desconectado do hub de notificações');
          this.isConnected.set(false);
          resolve();
        })
        .catch((err: unknown) => {
          console.error('Erro ao desconectar do hub:', err);
          reject(err);
        });
    });
  }

  testConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.hubConnection) {
        reject('Hub não foi inicializado');
        return;
      }

      this.hubConnection
        .invoke('TestConnection')
        .then(() => resolve())
        .catch((err: unknown) => reject(err));
    });
  }

  reset(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => {
        console.error('Erro ao parar conexão durante reset:', err);
      });
      this.hubConnection = null;
    }
    this.isConnected.set(false);
    this.novaNotificacao.set(null);
  }
}
