export enum PostType {
  Comum = 'Comum',
  Oficial = 'Oficial',
  Fixada = 'Fixada',
  Anuncio = 'Anuncio'
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  type: PostType;
  isPinned: boolean;
  likesCount: number;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  content: string;
  imageUrl?: string;
  type?: PostType;
}

export interface UpdatePostDto {
  content: string;
  imageUrl?: string;
}

export interface ReactResponse {
  reacted: boolean;
  likesCount: number;
}

export interface ShareResponse {
  sharesCount: number;
}

export interface SaveResponse {
  saved: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  userPhotoUrl?: string;
  conteudo: string;
  dataComentario: string;
  isAtivo: boolean;
}

export interface CreateCommentDto {
  conteudo: string;
}
