"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Book, BookStatus } from '@/types/book';
import { getBookById, updateBookProgress, updateBookStatus } from '@/lib/books';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    const foundBook = getBookById(resolvedParams.id);
    if (!foundBook) {
      router.push('/');
    } else {
      console.log("found book", foundBook);
      setBook(foundBook);
    }
  }, [resolvedParams.id, router]);

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
        <div className="relative">
          <div className="aspect-[3/4] relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 shadow-lg">
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full"
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
          </div>
        </div>
      </div>
    </div>
  );
} 