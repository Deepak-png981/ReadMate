export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4 text-center">
      <h1 className="text-5xl font-bold mb-6 tracking-tight text-indigo-600 dark:text-indigo-400">
        Welcome to ReadMate
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
        Your personal reading companion for discovering and tracking your favorite books.
      </p>
      <div className="w-20 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full mb-8"></div>
      <div className="flex justify-center space-x-4">
        <a 
          href="#" 
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
        >
          Get Started
        </a>
        <a 
          href="#" 
          className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-md shadow-sm transition-colors duration-200"
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
