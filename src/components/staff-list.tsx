'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Employee } from '@/lib/types';
import { StaffEditDialog } from './staff-edit-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

export default function StaffList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const employeesRef = useMemoFirebase(() =>
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  
  const { data: employees, isLoading: areEmployeesLoading, error } = useCollection<Employee>(employeesRef);

  useEffect(() => {
    // This effect will run once on mount to fetch all employees initially
    // as useCollection is now active. Subsequent searches will be filtered client-side.
  }, []);

  const handleSearch = () => {
    // Search is now client-side, this function is kept for potential future server-side search needs
    // or to trigger a re-fetch if data source changes. For now, filtering happens in `filteredEmployees`.
  }

  const filteredEmployees = employees?.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddNew = () => {
    const newEmployee: Employee = {
      id: '', // ID will be set in the dialog from the employeeId field
      name: '',
      department: '',
      ticketBalance: 0,
      employeeId: '',
    };
    setSelectedEmployee(newEmployee);
    setEditOpen(true);
  };


  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditOpen(true);
  };
  
  const handleDelete = (employeeId: string) => {
    if (!firestore) {
        console.error('[Inspect][StaffList] Firestore not available for delete.');
        return;
    }
    const employeeRef = doc(firestore, 'employees', employeeId);
    
    deleteDoc(employeeRef)
      .then(() => {
        toast({ title: 'Success', description: 'Employee has been deleted.'});
      })
      .catch((error) => {
        console.error("[Inspect][StaffList] Error deleting employee: ", error);
        const permissionError = new FirestorePermissionError({
            path: employeeRef.path, 
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete employee. You may not have permission.' });
      });
  };

  const onSuccessfulSave = () => {
      // Data will refresh automatically due to useCollection hook
      setEditOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Staff Database</CardTitle>
            <Button onClick={handleAddNew}>
                <UserPlus className="mr-2" />
                Add New Staff
              </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Ticket Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areEmployeesLoading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                ) : error ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-destructive">
                        Error: Could not load staff data. You may not have permission to view this list.
                      </TableCell>
                    </TableRow>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell><span className="font-medium">{employee.name}</span></TableCell>
                      <TableCell className="text-muted-foreground">{employee.id}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="font-medium">{employee.ticketBalance || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the employee record for {employee.name}. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(employee.id)} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No employees found. Try a different search or add new staff.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      <StaffEditDialog 
        isOpen={isEditOpen} 
        setIsOpen={setEditOpen} 
        employee={selectedEmployee} 
        onSaveSuccess={onSuccessfulSave}
      />
    </>
  );
}
