import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { BookDetail } from '@/types/books';
import { BookReader } from '@/components/reader/book-reader';

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get(`/api/books/${id}`);
      setBook(res.data);
    } catch {
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgress = async (page: number, totalPages: number) => {
    try {
      await api.post('/api/progress', {
        bookId: id,
        currentPage: page,
        totalPages,
        readingTimeSeconds: 30,
        interactionCount: 1,
        isCompleted: page >= totalPages,
      });
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book || book.pages.length === 0) {
    navigate('/library');
    return null;
  }

  return (
    <BookReader
      book={book}
      onClose={() => navigate(`/library/${id}`)}
      onProgress={handleProgress}
    />
  );
}
