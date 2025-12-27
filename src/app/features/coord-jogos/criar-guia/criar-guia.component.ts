
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GuiaService } from '../../../core/services/guia.service';
import { PastoralService } from '../../../core/services/pastoral.service';
import { CreateGuiaDto } from '../../../core/models/jogos.model';
import { Pastoral } from '../../../core/models/pastoral.model';

@Component({
  selector: 'app-criar-guia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './criar-guia.component.html',
  styleUrls: ['./criar-guia.component.scss']
})
export class CriarGuiaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private guiaService = inject(GuiaService);
  private pastoralService = inject(PastoralService);
  private router = inject(Router);

  pastorais = signal<Pastoral[]>([]);
  salvando = signal(false);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    descricao: ['', Validators.required],
    temaPrincipal: ['', Validators.required],
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
    pastoralId: ['', Validators.required],
    quantidadeProvas: [1, [Validators.required, Validators.min(1)]],
    duracaoEstimadaDias: [1, [Validators.required, Validators.min(1)]],
    requisitoIdadeMinima: [null],
    requisitoIdadeMaxima: [null],
    limiteTotalParticipantes: [null],
    imagemCapaUrl: [''],
    regulamentoUrl: [''],
    observacoesGerais: ['']
  });

  ngOnInit() {
    this.loadPastorais();
  }

  loadPastorais() {
    this.pastoralService.getAll().subscribe({
      next: (data) => this.pastorais.set(data),
      error: (err) => console.error('Erro ao carregar pastorais:', err)
    });
  }

  salvar() {
    if (this.form.valid) {
      this.salvando.set(true);
      const dto: CreateGuiaDto = this.form.value;

      this.guiaService.create(dto).subscribe({
        next: (guia) => {
          this.salvando.set(false);
          this.router.navigate(['/coord-jogos/guia', guia.id]);
        },
        error: (err) => {
          this.salvando.set(false);
          console.error('Erro ao criar guia:', err);
          alert('Erro ao criar guia. Tente novamente.');
        }
      });
    }
  }

  voltar() {
    this.router.navigate(['/coord-jogos']);
  }
}
