import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { PostType } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-create.html',
  styleUrl: './post-create.scss',
})
export class PostCreate implements OnInit {
  postForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  postId: string | null = null;
  postTypes = PostType;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  postTypeOptions = [
    { value: 'Comum', label: 'Comum' },
    { value: 'Oficial', label: 'Oficial' },
    { value: 'Fixada', label: 'Fixada' },
    { value: 'Anuncio', label: 'Anúncio' }
  ];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.postId;

    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      type: ['Comum', Validators.required],
      imageUrl: [null]
    });

    if (this.isEditMode && this.postId) {
      this.loadPost(this.postId);
    }
  }

  loadPost(id: string): void {
    this.loading = true;
    this.postService.getById(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          content: post.content,
          type: post.type,
          imageUrl: post.imageUrl
        });
        if (post.imageUrl) {
          this.imagePreview = post.imageUrl;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar post:', error);
        this.errorMessage = 'Erro ao carregar post';
        this.loading = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.postForm.value;

    const request = this.isEditMode && this.postId
      ? this.postService.update(this.postId, formData)
      : this.postService.create(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao salvar post';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/posts']);
  }
}
