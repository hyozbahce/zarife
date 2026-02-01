import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Book } from '@/types/books';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GripVertical, Plus, Trash2 } from 'lucide-react';

interface CurriculumItem {
  order: number;
  book: Book;
}

export default function CurriculumPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await api.get('/api/books?status=Published');
      setBooks(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const addToCurriculum = (book: Book) => {
    if (curriculum.some(c => c.book.id === book.id)) return;
    setCurriculum([...curriculum, { order: curriculum.length + 1, book }]);
  };

  const removeFromCurriculum = (bookId: string) => {
    setCurriculum(
      curriculum
        .filter(c => c.book.id !== bookId)
        .map((c, i) => ({ ...c, order: i + 1 }))
    );
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= curriculum.length) return;
    const updated = [...curriculum];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setCurriculum(updated.map((c, i) => ({ ...c, order: i + 1 })));
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Curriculum Builder</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Available Books
            </CardTitle>
            <CardDescription>Published books you can add to the reading sequence.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : books.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No published books available.</p>
            ) : (
              <div className="space-y-2">
                {books.map(book => (
                  <div key={book.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {book.durationMinutes}m | Ages {book.targetAgeMin}-{book.targetAgeMax}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCurriculum(book)}
                      disabled={curriculum.some(c => c.book.id === book.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Curriculum Sequence */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Sequence</CardTitle>
            <CardDescription>Drag to reorder. Students will read in this sequence.</CardDescription>
          </CardHeader>
          <CardContent>
            {curriculum.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Add books from the left to build your curriculum.
              </p>
            ) : (
              <div className="space-y-2">
                {curriculum.map((item, index) => (
                  <div key={item.book.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 1)}
                        disabled={index === curriculum.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-3 w-3" />
                      </button>
                    </div>
                    <Badge variant="secondary" className="h-8 w-8 items-center justify-center rounded-full p-0 text-xs">
                      {item.order}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.book.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.book.durationMinutes}m | {item.book.pageCount} pages
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCurriculum(item.book.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
