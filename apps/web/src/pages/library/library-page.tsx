import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import type { Book } from '@/types/books';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Plus, Clock, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  const isAdmin = user?.role === 'PlatformAdmin' || user?.role === 'SchoolAdmin';

  useEffect(() => {
    loadBooks();
  }, [statusFilter]);

  const loadBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/api/books?${params}`);
      setBooks(res.data);
    } catch {
      // silently handle
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks();
  };

  const statusColors: Record<string, string> = {
    Draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('library.title')}</h2>
        {isAdmin && (
          <Button asChild>
            <Link to="/stories/new">
              <Plus className="mr-2 h-4 w-4" /> {t('library.newBook')}
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('library.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">{t('library.search')}</Button>
        </form>
        <div className="flex gap-1">
          {[
            { value: '', label: t('library.all') },
            { value: 'Draft', label: t('library.statusDraft') },
            { value: 'Review', label: t('library.statusReview') },
            { value: 'Published', label: t('library.statusPublished') },
          ].map((s) => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : books.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('library.noBooks')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? t('library.createFirst') : t('library.notAvailable')}
          </p>
          {isAdmin && (
            <Button asChild className="mt-4">
              <Link to="/stories/new"><Plus className="mr-2 h-4 w-4" /> {t('library.createBook')}</Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Link key={book.id} to={`/library/${book.id}`}>
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer h-full">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1">{book.title}</CardTitle>
                    <Badge variant="secondary" className={statusColors[book.status] || ''}>
                      {book.status}
                    </Badge>
                  </div>
                  {book.author && (
                    <p className="text-xs text-muted-foreground">{t('library.by')} {book.author}</p>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  {book.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{book.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{t('library.ages', { min: book.targetAgeMin, max: book.targetAgeMax })}
                  </span>
                  <span>{t('library.pages', { count: book.pageCount })}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
