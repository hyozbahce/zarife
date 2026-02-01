import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSchoolModal({ isOpen, onClose, onSuccess }: CreateSchoolModalProps) {
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/api/management/schools', {
        name,
        adminEmail,
        adminPassword,
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t('management.createSchool.defaultError'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAdminEmail('');
    setAdminPassword('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('management.createSchool.title')}</DialogTitle>
            <DialogDescription>
              {t('management.createSchool.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="school-name">{t('management.createSchool.schoolName')}</Label>
              <Input
                id="school-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('management.createSchool.schoolNamePlaceholder')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">{t('management.createSchool.adminEmail')}</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={t('management.createSchool.adminEmailPlaceholder')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">{t('management.createSchool.initialPassword')}</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={t('management.createSchool.passwordPlaceholder')}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              {t('management.createSchool.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('management.createSchool.creating')}
                </>
              ) : (
                t('management.createSchool.createSchool')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
