import { Book } from '@/types/book';

const BOOKS_KEY = 'readmate_books';

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  const books = localStorage.getItem(BOOKS_KEY);
  return books ? JSON.parse(books) : [];
}

export function addBook(book: Omit<Book, 'id' | 'createdAt'>): Book {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify([newBook, ...books]));
  return newBook;
} 