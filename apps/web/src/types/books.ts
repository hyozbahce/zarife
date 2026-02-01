export interface Book {
  id: string;
  title: string;
  author?: string;
  illustrator?: string;
  language: string;
  targetAgeMin: number;
  targetAgeMax: number;
  durationMinutes: number;
  coverImageUrl?: string;
  description?: string;
  status: string;
  categories?: string[];
  pageCount: number;
  createdAt: string;
}

export interface BookPage {
  id: string;
  pageNumber: number;
  riveFileUrl?: string;
  stateMachine?: string;
  artboard?: string;
  narrationAudioUrl?: string;
  narrationText?: string;
}

export interface BookDetail extends Book {
  pages: BookPage[];
}

export interface CreateBookRequest {
  title: string;
  author?: string;
  illustrator?: string;
  language: string;
  targetAgeMin: number;
  targetAgeMax: number;
  durationMinutes: number;
  description?: string;
  categories?: string[];
}

export interface UpdateBookRequest extends CreateBookRequest {
  status?: string;
}
