import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ClassResponse, Student, AnalyticsResponse } from '@/types/students';
import type { Book } from '@/types/books';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GraduationCap, Users, BookOpen, Clock, Target, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/classes').then(r => setClasses(r.data)),
      api.get('/api/students').then(r => setStudents(r.data)),
      api.get('/api/progress/analytics').then(r => setAnalytics(r.data)),
      api.get('/api/books?status=Published').then(r => setBooks(r.data)),
    ]).catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selectedBook || !selectedClass) return;
    try {
      await api.post('/api/assignments', {
        bookId: selectedBook,
        classId: selectedClass,
      });
      setIsAssignOpen(false);
    } catch {
      // handle error
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogTrigger asChild>
            <Button><Send className="mr-2 h-4 w-4" /> Assign Book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Book to Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Book</Label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Choose a book...</option>
                  {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Select Class</Label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Choose a class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} (Grade {c.gradeLevel})</option>)}
                </select>
              </div>
              <Button onClick={handleAssign} className="w-full" disabled={!selectedBook || !selectedClass}>
                Assign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBooksRead || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completionRate.toFixed(0) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Class Overview</CardTitle>
          <CardDescription>Students enrolled across your classes.</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No classes assigned yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(cls => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>Grade {cls.gradeLevel}</TableCell>
                    <TableCell><Badge variant="secondary">{cls.studentCount}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Student Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>Reading activity across all students.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No students enrolled yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Books Read</TableHead>
                  <TableHead>Reading Time</TableHead>
                  <TableHead>Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.displayName}</TableCell>
                    <TableCell>{s.className || 'Unassigned'}</TableCell>
                    <TableCell>{s.totalBooksRead}</TableCell>
                    <TableCell>{formatTime(s.totalReadingTimeSeconds)}</TableCell>
                    <TableCell>{s.currentStreak > 0 ? `${s.currentStreak}d` : '-'}</TableCell>
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
