import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { BookDetail } from '@/types/books';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, Edit, Trash2, Clock, Users, Globe, Play } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'PlatformAdmin' || user?.role === 'SchoolAdmin';
  const { t } = useTranslation();

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

  const handleDelete = async () => {
    if (!confirm(t('library.detail.confirmDelete'))) return;
    try {
      await api.delete(`/api/books/${id}`);
      navigate('/library');
    } catch {
      // handle error
    }
  };

  const handlePublish = async () => {
    try {
      await api.put(`/api/books/${id}/publish`);
      loadBook();
    } catch {
      // handle error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/library"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{book.title}</h2>
          {book.author && <p className="text-muted-foreground">{t('library.by')} {book.author}</p>}
        </div>
        <Badge variant="secondary" className="text-sm">{book.status}</Badge>
        {book.pages.length > 0 && (
          <Button onClick={() => navigate(`/reader/${book.id}`)}>
            <Play className="mr-2 h-4 w-4" /> {t('library.detail.readBook')}
          </Button>
        )}
        {isAdmin && (
          <div className="flex gap-2">
            {book.status !== 'Published' && (
              <Button onClick={handlePublish} variant="default">{t('library.detail.publish')}</Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/stories/${book.id}/edit`}><Edit className="mr-2 h-4 w-4" />{t('library.detail.edit')}</Link>
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('library.detail.bookDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover rounded-lg" />
              ) : (
                <BookOpen className="h-20 w-20 text-primary/30" />
              )}
            </div>
            {book.description && (
              <p className="text-sm text-muted-foreground">{book.description}</p>
            )}
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.categories.map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('library.detail.info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{t('library.detail.minutes', { count: book.durationMinutes })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t('library.ages', { min: book.targetAgeMin, max: book.targetAgeMax })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{t(`library.detail.language.${book.language}`, book.language)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{t('library.pages', { count: book.pageCount })}</span>
              </div>
              {book.illustrator && (
                <div className="text-muted-foreground">
                  {t('library.detail.illustratedBy', { name: book.illustrator })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {book.pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('library.detail.pagesTitle', { count: book.pages.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {book.pages.map((page) => (
                <Card key={page.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                      {page.pageNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      {page.narrationText && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{page.narrationText}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {page.riveFileUrl && <Badge variant="outline" className="text-xs">{t('library.detail.rive')}</Badge>}
                        {page.narrationAudioUrl && <Badge variant="outline" className="text-xs">{t('library.detail.audio')}</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
