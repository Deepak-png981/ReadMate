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
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.02] duration-200"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {book.author}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-500">
                      {book.totalPages} pages
                    </span>
                    {book.startDate && (
                      <span className="text-indigo-600 dark:text-indigo-400">
                        Started: {new Date(book.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
