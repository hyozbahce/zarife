import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { AnalyticsResponse } from '@/types/students';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, Sparkles, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/api/progress/analytics');
      setAnalytics(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    { title: 'Books Completed', value: analytics.totalBooksRead, icon: BookOpen, color: 'text-green-500' },
    { title: 'In Progress', value: analytics.totalBooksInProgress, icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Total Reading Time', value: formatTime(analytics.totalReadingTimeSeconds), icon: Clock, color: 'text-orange-500' },
    { title: 'Completion Rate', value: `${analytics.completionRate.toFixed(1)}%`, icon: Target, color: 'text-purple-500' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Recent Activity
          </CardTitle>
          <CardDescription>Latest reading progress across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reading activity yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Interactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentActivity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.bookTitle || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.totalPages > 0 ? (item.currentPage / item.totalPages) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.currentPage}/{item.totalPages}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isCompleted ? 'default' : 'secondary'}>
                        {item.isCompleted ? 'Completed' : 'Reading'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(item.readingTimeSeconds)}</TableCell>
                    <TableCell>{item.interactionCount}</TableCell>
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
