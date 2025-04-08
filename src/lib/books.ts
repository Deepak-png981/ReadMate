import { Book, BookStatus } from '@/types/book';

const BOOKS_KEY = 'readmate_books';

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  const books = localStorage.getItem(BOOKS_KEY);
  return books ? JSON.parse(books) : [];
}

export function getBookById(id: string): Book | undefined {
  const books = getBooks();
  return books.find(book => book.id === id);
}

export function addBook(book: Omit<Book, 'id' | 'createdAt' | 'currentPage' | 'status'>): Book {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    currentPage: 0,
    status: 'reading',
    totalPages: Number(book.totalPages) || 0,
  };
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify([newBook, ...books]));
  return newBook;
}

export function updateBookProgress(id: string, currentPage: number): Book {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) throw new Error('Book not found');

  const validatedCurrentPage = Math.max(0, Math.min(Number(currentPage) || 0, book.totalPages));
  
  const updatedBooks = books.map(b => 
    b.id === id ? { ...b, currentPage: validatedCurrentPage } : b
  );
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  return updatedBooks.find(b => b.id === id)!;
}

export function updateBookStatus(id: string, status: BookStatus): Book {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) throw new Error('Book not found');

  const updatedBooks = books.map(b => 
    b.id === id ? { 
      ...b, 
      status,
      currentPage: status === 'completed' ? b.totalPages : b.currentPage 
    } : b
  );
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  return updatedBooks.find(b => b.id === id)!;
} 