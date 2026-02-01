import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  role?: string;
  tenantId?: string;
  createdAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const res = await api.get(`/api/users${params}`);
      setUsers(res.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    PlatformAdmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    SchoolAdmin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Teacher: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Parent: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Student: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      </div>

      <div className="flex gap-1">
        {['', 'PlatformAdmin', 'SchoolAdmin', 'Teacher', 'Parent', 'Student'].map((r) => (
          <Button
            key={r}
            variant={roleFilter === r ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter(r)}
          >
            {r || 'All'}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tenant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={roleColors[user.role || ''] || ''}>
                        {user.role || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {user.tenantId ? user.tenantId.substring(0, 8) + '...' : 'Platform'}
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
