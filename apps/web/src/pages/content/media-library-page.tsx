import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Trash2, Image, Music, Film, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MediaAsset {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  assetType: string;
  bucketName: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadAssets();
  }, [filter]);

  const loadAssets = async () => {
    try {
      const params = filter ? `?assetType=${filter}` : '';
      const res = await api.get(`/api/content/assets${params}`);
      setAssets(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/api/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadAssets();
    } catch {
      // handle error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('content.media.confirmDelete'))) return;
    try {
      await api.delete(`/api/content/assets/${id}`);
      setAssets(assets.filter(a => a.id !== id));
    } catch {
      // handle error
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'video': return <Film className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('content.media.title')}</h2>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleUpload}
            className="max-w-xs"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      <div className="flex gap-1">
        {[
          { value: '', label: t('content.media.all') },
          { value: 'image', label: t('content.media.typeImage') },
          { value: 'audio', label: t('content.media.typeAudio') },
          { value: 'animation', label: t('content.media.typeAnimation') },
          { value: 'rive', label: t('content.media.typeRive') },
          { value: 'other', label: t('content.media.typeOther') },
        ].map((tp) => (
          <Button
            key={tp.value}
            variant={filter === tp.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tp.value)}
          >
            {tp.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('content.media.assetCount', { count: assets.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Upload className="h-12 w-12 mb-4" />
              <p>{t('content.media.noAssets')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('content.media.tableType')}</TableHead>
                  <TableHead>{t('content.media.tableFileName')}</TableHead>
                  <TableHead>{t('content.media.tableSize')}</TableHead>
                  <TableHead>{t('content.media.tableBucket')}</TableHead>
                  <TableHead>{t('content.media.tableUploaded')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getIcon(asset.assetType)} {asset.assetType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {asset.fileName}
                    </TableCell>
                    <TableCell>{formatSize(asset.sizeBytes)}</TableCell>
                    <TableCell><Badge variant="secondary">{asset.bucketName}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
