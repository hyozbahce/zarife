import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordsMismatch'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/account/register', { email, password });
      login(response.data);
      navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t('auth.register.defaultError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('auth.register.createAccount')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.register.registerSchool')}
          </p>
        </div>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/20 dark:shadow-none">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">{t('auth.register.title')}</CardTitle>
              <CardDescription>
                {t('auth.register.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-50/50 dark:bg-zinc-900/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('auth.register.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-50/50 dark:bg-zinc-900/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">{t('auth.register.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-zinc-50/50 dark:bg-zinc-900/50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.register.creatingAccount')}
                  </>
                ) : (
                  t('auth.register.createAccountBtn')
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {t('auth.register.alreadyHaveAccount')}{' '}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline hover:underline-offset-4"
                >
                  {t('auth.register.logIn')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
