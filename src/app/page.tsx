"use client";

import { useEffect, useState } from 'react';
import { Book } from '@/types/book';
import { getBooks } from '@/lib/books';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const getProgressColor = (status: Book['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 dark:bg-green-500';
      case 'dropped':
        return 'bg-gray-600 dark:bg-gray-500';
      default:
        return 'bg-indigo-600 dark:bg-indigo-500';
    }
  };

  const getStatusBadgeStyle = (status: Book['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20';
      case 'dropped':
        return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-gray-400 ring-gray-600/20 dark:ring-gray-500/20';
      default:
        return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-600/20 dark:ring-indigo-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-5xl font-bold mb-6 tracking-tight text-indigo-600 dark:text-indigo-400">
            Welcome to ReadMate
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
            Your personal reading companion for discovering and tracking your favorite books.
          </p>
          <div className="w-20 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mb-8"></div>
          <Link
            href="/add"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
          >
            Add Your First Book
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Your Reading List
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => {
              const progress = Math.round((book.currentPage / book.totalPages) * 100) || 0;
              
              return (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={book.coverUrl}
                      alt={`Cover of ${book.title}`}
                      className="object-cover w-full h-full"
                    />
                    <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${
                      book.status === 'reading' 
                        ? 'from-black/70 to-transparent' 
                        : 'from-black/90 to-transparent'
                    }`}>
                      {book.status !== 'reading' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full text-sm font-medium capitalize shadow-lg">
                            {book.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      by {book.author}
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        {book.status === 'dropped' ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusBadgeStyle(book.status)}`}>
                            Not Interested
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className={`flex h-2 w-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} />
                            <span className={`text-sm font-medium ${progress === 100 ? 'text-green-700 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                              {progress}%
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                          {book.currentPage}/{book.totalPages}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(book.status)} transition-all duration-300`}
                          style={{
                            width: `${progress}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
