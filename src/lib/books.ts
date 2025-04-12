import { Book, BookStatus, Note } from '@/types/book';
import { getGoals, updateGoalProgress } from '@/lib/goals';

const BOOKS_KEY = 'readmate_books';

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  const books = localStorage.getItem(BOOKS_KEY);
  const parsedBooks = books ? JSON.parse(books) : [];
  return parsedBooks.map((book: Book) => ({
    ...book,
    notes: book.notes || [],
  }));
}

export function getBookById(id: string): Book | undefined {
  const books = getBooks();
  const book = books.find(book => book.id === id);
  return book ? { ...book, notes: book.notes || [] } : undefined;
}

export function addBook(book: Omit<Book, 'id' | 'createdAt' | 'currentPage' | 'status' | 'notes'>): Book {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    currentPage: 0,
    status: 'reading',
    totalPages: Number(book.totalPages) || 0,
    notes: [],
  };
  
  localStorage.setItem(BOOKS_KEY, JSON.stringify([newBook, ...books]));
  return newBook;
}

function updateGoalProgressFromBookChange(oldPage: number, newPage: number) {
  const goals = getGoals();
  const activeGoals = goals.filter(g => g.status === 'active');
  if (activeGoals.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  const pageDiff = newPage - oldPage;
  
  if (pageDiff !== 0) {
    // Update all active goals with the page difference
    activeGoals.forEach(goal => {
      updateGoalProgress(goal.id, today, pageDiff);
    });
  }
}

export function updateBookProgress(id: string, currentPage: number): Book {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) throw new Error('Book not found');

  const validatedCurrentPage = Math.max(0, Math.min(Number(currentPage) || 0, book.totalPages));
  
  // Update goal progress before updating the book
  updateGoalProgressFromBookChange(book.currentPage, validatedCurrentPage);
  
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

export function addNote(bookId: string, content: string): Book {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) throw new Error('Book not found');

  const now = new Date().toISOString();
  const newNote: Note = {
    id: crypto.randomUUID(),
    content,
    createdAt: now,
    updatedAt: now,
  };

  const updatedBooks = books.map(b =>
    b.id === bookId ? { ...b, notes: [newNote, ...b.notes] } : b
  );

  localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  return updatedBooks.find(b => b.id === bookId)!;
}

export function editNote(bookId: string, noteId: string, content: string): Book {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) throw new Error('Book not found');

  const updatedBooks = books.map(b =>
    b.id === bookId ? {
      ...b,
      notes: b.notes.map(note =>
        note.id === noteId ? {
          ...note,
          content,
          updatedAt: new Date().toISOString(),
        } : note
      ),
    } : b
  );

  localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  return updatedBooks.find(b => b.id === bookId)!;
}

export function deleteNote(bookId: string, noteId: string): Book {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) throw new Error('Book not found');

  const updatedBooks = books.map(b =>
    b.id === bookId ? {
      ...b,
      notes: b.notes.filter(note => note.id !== noteId),
    } : b
  );

  localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  return updatedBooks.find(b => b.id === bookId)!;
} 