export enum PostType {
  Comum = 'Comum',
  Aviso = 'Aviso',
  Evento = 'Evento',
  Reflexao = 'Reflexao'
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  type: string;
  isPinned: boolean;
  likesCount: number;
  authorId: string;
  authorName?: string;
  authorPhotoUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  reactions?: PostReaction[];
  comments?: PostComment[];
  shares?: PostShare[];
  userHasReacted?: boolean;
  userHasSaved?: boolean;
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  dataReacao: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  conteudo: string;
  isAtivo: boolean;
  dataComentario: Date;
}

export interface PostShare {
  id: string;
  postId: string;
  userId: string;
  dataCompartilhamento: Date;
}

export interface CreatePostDto {
  content: string;
  imageUrl?: string;
  type: string;
}

export interface CreateCommentDto {
  conteudo: string;
}

export interface UpdatePostDto {
  content: string;
  imageUrl?: string;
}
