import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PastoralService } from '../../../../core/services/pastoral.service';
import { CreatePastoralDto, UpdatePastoralDto } from '../../../../core/models/pastoral.model';

@Component({
  selector: 'app-pastoral-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pastoral-form.component.html',
  styleUrl: './pastoral-form.component.scss'
})
export class PastoralFormComponent implements OnInit {
  private pastoralService = inject(PastoralService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isSubmitting = signal(false);
  pastoralId: string | null = null;

  formData: CreatePastoralDto = {
    name: '',
    sigla: '',
    tipoPastoral: 'Geral',
    type: 'PNEW',
    description: '',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    logoUrl: '',
    icon: ''
  };

  ngOnInit(): void {
    this.pastoralId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.pastoralId);

    if (this.isEditMode() && this.pastoralId) {
      this.pastoralService.getById(this.pastoralId).subscribe({
        next: (pastoral) => {
          this.formData = {
            name: pastoral.name,
            sigla: pastoral.sigla,
            tipoPastoral: pastoral.tipoPastoral,
            type: pastoral.type,
            description: pastoral.description,
            primaryColor: pastoral.primaryColor,
            secondaryColor: pastoral.secondaryColor,
            logoUrl: pastoral.logoUrl || '',
            icon: pastoral.icon || ''
          };
        }
      });
    }
  }

  save(): void {
    this.isSubmitting.set(true);

    if (this.isEditMode() && this.pastoralId) {
      this.pastoralService.update(this.pastoralId, this.formData as UpdatePastoralDto).subscribe({
        next: () => this.router.navigate(['/admin/pastorais']),
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.pastoralService.create(this.formData).subscribe({
        next: () => this.router.navigate(['/admin/pastorais']),
        error: () => this.isSubmitting.set(false)
      });
    }
  }
}
