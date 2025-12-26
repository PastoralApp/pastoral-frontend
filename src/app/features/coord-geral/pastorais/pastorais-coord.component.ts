import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PastoralService } from '../../../core/services/pastoral.service';
import { Pastoral } from '../../../core/models/pastoral.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-pastorais-coord',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pastorais-coord.component.html',
  styleUrl: './pastorais-coord.component.scss'
})
export class PastoraisCoordComponent implements OnInit {
  private pastoralService = inject(PastoralService);
  private toastService = inject(ToastService);

  pastorais = signal<Pastoral[]>([]);
  isLoading = signal(true);
  editingId = signal<string | null>(null);
  tempColor = signal<string>('');

  ngOnInit(): void {
    this.loadPastorais();
  }

  loadPastorais(): void {
    this.isLoading.set(true);
    this.pastoralService.getAll().subscribe({
      next: (pastorais) => {
        this.pastorais.set(pastorais);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar pastorais');
        this.isLoading.set(false);
      }
    });
  }

  startEdit(pastoral: Pastoral): void {
    this.editingId.set(pastoral.id);
    this.tempColor.set(pastoral.primaryColor);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.tempColor.set('');
  }

  saveColor(pastoral: Pastoral): void {
    const newColor = this.tempColor();
    
    if (!this.isValidHexColor(newColor)) {
      this.toastService.error('Cor inválida. Use o formato #RRGGBB');
      return;
    }

    this.pastoralService.updateColor(pastoral.id.toString(), newColor).subscribe({
      next: () => {
        const updated = this.pastorais().map(p => 
          p.id === pastoral.id ? { ...p, primaryColor: newColor } : p
        );
        this.pastorais.set(updated);
        this.editingId.set(null);
        this.tempColor.set('');
        this.toastService.success('Cor atualizada com sucesso!');
      },
      error: (err) => {
        this.toastService.error('Erro ao atualizar cor da pastoral');
      }
    });
  }

  isEditing(id: string | number): boolean {
    return this.editingId() === id.toString();
  }

  isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  getContrastColor(hexColor: string): string {
    const color = hexColor.substring(1);
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
