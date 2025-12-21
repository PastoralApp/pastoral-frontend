export enum PostType {
  Aviso = 0,
  Evento = 1,
  Reflexao = 2,
  Comunicado = 3
}

export interface Post {
  id?: string;
  titulo: string;
  conteudo: string;
  tipo: PostType;
  imagemUrl?: string;
  autorId: string;
  pastoralId?: string;
  grupoId?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePostDto {
  titulo: string;
  conteudo: string;
  tipo: PostType;
  imagemUrl?: string;
  tags?: string[];
}

export interface UpdatePostDto {
  titulo: string;
  conteudo: string;
  tipo: PostType;
  imagemUrl?: string;
  tags?: string[];
}
