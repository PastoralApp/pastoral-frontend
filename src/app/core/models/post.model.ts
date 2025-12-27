export enum PostType {
  Comum = 'Comum',
  Oficial = 'Oficial',
  Fixada = 'Fixada',
  Anuncio = 'Anuncio',
  Aviso = 'Aviso'
}

export enum TipoPastoral {
  PA = 'PA',
  PJ = 'PJ',
  PJA = 'PJA',
  PANSA = 'PANSA',
  OUTRA = 'OUTRA',
  Geral = 'Geral'
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  type: PostType;
  tipoPastoral: TipoPastoral;
  pastoralId?: string;
  isPinned: boolean;
  pinType?: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
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
  tipoPastoral?: TipoPastoral;
  pastoralId?: string;
}

export interface UpdatePostDto {
  content: string;
  imageUrl?: string;
}

export interface ChangePostTypeDto {
  type: string;
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

export interface PostDetailDto {
  id: string;
  content: string;
  imageUrl?: string;
  type: PostType;
  tipoPastoral: TipoPastoral;
  pastoralId?: string;
  isPinned: boolean;
  pinType?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  createdAt: string;
  updatedAt?: string;
  comments: PostComment[];
}
