export type BookStatus = 'reading' | 'completed' | 'dropped';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl: string;
  startDate?: string;
  createdAt: string;
  status: BookStatus;
  notes: Note[];
} 