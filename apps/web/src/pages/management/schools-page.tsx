import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building2, 
  Calendar, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateSchoolModal } from '@/components/management/create-school-modal';
import type { SchoolResponse } from '../../types/management';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/api/management/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/api/management/schools/${id}`);
      setSchools(schools.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete school:', error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schools</h2>
          <p className="text-muted-foreground italic">Manage educational institutions and their administrators.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add New School
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered Schools</CardTitle>
              <CardDescription>A list of all schools currently on the platform.</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">{schools.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[400px]">School Details</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground animate-pulse">
                    Retrieving records...
                  </TableCell>
                </TableRow>
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                       <Building2 className="h-10 w-10 text-muted-foreground/50" />
                       <p className="text-muted-foreground font-medium">No schools found</p>
                       <Button variant="link" onClick={() => setIsModalOpen(true)}>Create the first one</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id} className="group transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{school.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                             ID: {school.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm font-medium">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {new Date(school.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Active
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive cursor-pointer"
                            onClick={() => handleDelete(school.id, school.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete School
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateSchoolModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSchools} 
      />
    </div>
  );
}
