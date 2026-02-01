import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import type { CreateBookRequest } from '@/types/books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function BookEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState<CreateBookRequest>({
    title: '',
    author: '',
    illustrator: '',
    language: 'tr',
    targetAgeMin: 3,
    targetAgeMax: 6,
    durationMinutes: 5,
    description: '',
    categories: [],
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get(`/api/books/${id}`);
      const book = res.data;
      setForm({
        title: book.title,
        author: book.author || '',
        illustrator: book.illustrator || '',
        language: book.language,
        targetAgeMin: book.targetAgeMin,
        targetAgeMax: book.targetAgeMax,
        durationMinutes: book.durationMinutes,
        description: book.description || '',
        categories: book.categories || [],
      });
    } catch {
      navigate('/library');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await api.put(`/api/books/${id}`, form);
        navigate(`/library/${id}`);
      } else {
        const res = await api.post('/api/books', form);
        navigate(`/library/${res.data.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    if (categoryInput.trim() && !form.categories?.includes(categoryInput.trim())) {
      setForm({ ...form, categories: [...(form.categories || []), categoryInput.trim()] });
      setCategoryInput('');
    }
  };

  const removeCategory = (cat: string) => {
    setForm({ ...form, categories: form.categories?.filter(c => c !== cat) });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/library"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditing ? 'Edit Book' : 'Create New Book'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="illustrator">Illustrator</Label>
                <Input
                  id="illustrator"
                  value={form.illustrator}
                  onChange={(e) => setForm({ ...form, illustrator: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="tr">Turkish</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="targetAgeMin">Min Age</Label>
                <Input
                  id="targetAgeMin"
                  type="number"
                  min={1}
                  max={18}
                  value={form.targetAgeMin}
                  onChange={(e) => setForm({ ...form, targetAgeMin: parseInt(e.target.value) || 3 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAgeMax">Max Age</Label>
                <Input
                  id="targetAgeMax"
                  type="number"
                  min={1}
                  max={18}
                  value={form.targetAgeMax}
                  onChange={(e) => setForm({ ...form, targetAgeMax: parseInt(e.target.value) || 6 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="Add category..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                />
                <Button type="button" variant="secondary" onClick={addCategory}>Add</Button>
              </div>
              {form.categories && form.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20"
                      onClick={() => removeCategory(cat)}
                    >
                      {cat} &times;
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/library')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Saving...' : 'Creating...'}</>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Book'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
