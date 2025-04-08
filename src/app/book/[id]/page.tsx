"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book, BookStatus } from '@/types/book';
import { getBookById, updateBookProgress, updateBookStatus, addNote, editNote, deleteNote } from '@/lib/books';

export default function BookPage() {
  const router = useRouter();
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;
    const foundBook = getBookById(id);
    if (!foundBook) {
      router.push('/');
      return;
    }
    setBook(foundBook);
  }, [id, router]);

  if (!book) return null;

  const progress = Math.round((book.currentPage / book.totalPages) * 100) || 0;

  const handleProgressUpdate = (currentPage: number | string) => {
    if (isUpdating) return;
    
    // Convert to number and validate
    const newPage = Math.max(0, Math.min(Number(currentPage) || 0, book.totalPages));
    if (isNaN(newPage)) return;
    
    setIsUpdating(true);
    try {
      const updatedBook = updateBookProgress(book.id, newPage);
      setBook(updatedBook);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = (status: BookStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const updatedBook = updateBookStatus(book.id, status);
      setBook(updatedBook);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !noteContent.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedBook = addNote(book.id, noteContent.trim());
      setBook(updatedBook);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !editingNote || isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedBook = editNote(book.id, editingNote.id, editingNote.content.trim());
      setBook(updatedBook);
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to edit note:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!book || isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedBook = deleteNote(book.id, noteId);
      setBook(updatedBook);
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 dark:bg-green-500';
      case 'dropped':
        return 'bg-gray-600 dark:bg-gray-500';
      default:
        return 'bg-indigo-600 dark:bg-indigo-500';
    }
  };

  const getStatusBadgeStyle = (status: BookStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20';
      case 'dropped':
        return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-gray-600/20 dark:ring-gray-500/20';
      default:
        return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-600/20 dark:ring-indigo-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-8 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="rounded-lg object-cover shadow-lg"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          {book.startDate && (
            <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-lg backdrop-blur-sm shadow-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Started Reading
                <span className="block text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                  {new Date(book.startDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {book.title}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusBadgeStyle(book.status)}`}>
                {book.status === 'dropped' ? 'Not Interested' : book.status === 'completed' ? 'Completed' : 'Reading'}
              </span>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              by {book.author}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Reading Progress
                  </h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {book.currentPage} of {book.totalPages} pages
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} />
                      <span className={`text-sm font-medium ${progress === 100 ? 'text-green-700 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {book.status === 'reading' && (
                <div className="space-y-4">
                  <div className="relative pt-2">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStatusColor(book.status)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={book.totalPages}
                      value={book.currentPage}
                      onChange={(e) => handleProgressUpdate(e.target.value)}
                      className="absolute inset-x-0 top-0 h-4 opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleProgressUpdate(Math.max(0, book.currentPage - 1))}
                      disabled={book.currentPage === 0 || isUpdating}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={book.totalPages}
                      value={book.currentPage}
                      onChange={(e) => handleProgressUpdate(e.target.value)}
                      className="w-20 px-3 py-1 text-center text-lg font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() => handleProgressUpdate(Math.min(book.totalPages, book.currentPage + 1))}
                      disabled={book.currentPage === book.totalPages || isUpdating}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Reading Status
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleStatusUpdate('reading')}
                  disabled={isUpdating || book.status === 'reading'}
                  className={`px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 ${
                    book.status === 'reading'
                      ? 'bg-indigo-600 dark:bg-indigo-500 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-indigo-600 dark:ring-indigo-500'
                      : 'bg-indigo-600/60 dark:bg-indigo-500/60 hover:bg-indigo-600 dark:hover:bg-indigo-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Reading
                </button>
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating || book.status === 'completed'}
                  className={`px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 ${
                    book.status === 'completed'
                      ? 'bg-green-600 dark:bg-green-500 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-green-600 dark:ring-green-500'
                      : 'bg-green-600/60 dark:bg-green-500/60 hover:bg-green-600 dark:hover:bg-green-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusUpdate('dropped')}
                  disabled={isUpdating || book.status === 'dropped'}
                  className={`px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 ${
                    book.status === 'dropped'
                      ? 'bg-gray-600 dark:bg-gray-500 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-gray-600 dark:ring-gray-500'
                      : 'bg-gray-600/60 dark:bg-gray-500/60 hover:bg-gray-600 dark:hover:bg-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Not Interested
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notes
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {book.notes?.length || 0} note{book.notes?.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write your thoughts about the book..."
                        className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        disabled={isUpdating}
                      />
                      <div className="absolute bottom-3 right-3">
                        <button
                          type="submit"
                          disabled={!noteContent.trim() || isUpdating}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                        >
                          <svg 
                            className="w-4 h-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Note
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {book.notes && book.notes.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {book.notes.map((note) => (
                      <div 
                        key={note.id} 
                        className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 ${
                          editingNote?.id === note.id ? 'ring-2 ring-indigo-500' : 'hover:border-indigo-500/50 dark:hover:border-indigo-500/50'
                        }`}
                      >
                        {editingNote?.id === note.id ? (
                          <form onSubmit={handleEditNote} className="space-y-4">
                            <div className="relative">
                              <textarea
                                value={editingNote.content}
                                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                disabled={isUpdating}
                                autoFocus
                              />
                              <div className="absolute top-2 right-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingNote(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <button
                                  type="submit"
                                  disabled={!editingNote.content.trim() || isUpdating}
                                  className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm leading-relaxed flex-1">
                                {note.content}
                              </p>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setEditingNote({ id: note.id, content: note.content })}
                                  className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                  title="Edit note"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Delete note"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No notes yet. Add your first note about this book!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 