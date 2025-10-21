
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function StaffList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [areEmployeesLoading, setAreEmployeesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchEmployees() {
      setAreEmployeesLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/employees/list");
        if (!res.ok) {
           const errorData = await res.json().catch(() => ({ error: 'Failed to fetch employees. The API route might be missing or crashing.' }));
           throw new Error(errorData.error);
        }
        
        const data = await res.json();

        if (data.success) {
          setEmployees(data.employees);
        } else {
          throw new Error(data.error || "An unknown error occurred while fetching employees.");
        }
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        if (err.message.includes("JSON")) {
            setError("The server returned an invalid response. The API route might be missing or failing.");
        } else {
            setError(err.message);
        }
      } finally {
        setAreEmployeesLoading(false);
      }
    }

    fetchEmployees();
  }, []);


  const filteredEmployees = useMemo(() => employees?.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [], [employees, searchTerm]);

  const handleAddNew = () => {
    const newEmployee: Employee = {
      id: '',
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
  
  const handleDelete = (employee: Employee) => {
    startDeleteTransition(async () => {
      try {
        const response = await fetch(`/api/employees/${employee.id}`, {
          method: 'DELETE',
        });
        const result = await response.json();

        if (response.ok) {
          toast({ title: 'Success', description: `Employee '${employee.name}' has been deleted.` });
          setEmployees(currentEmployees => currentEmployees.filter(emp => emp.id !== employee.id));
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error || 'Could not delete employee.' });
        }
      } catch (error) {
        console.error("Error deleting employee: ", error);
        toast({ variant: 'destructive', title: 'Network Error', description: 'Could not connect to the server to delete employee.' });
      }
    });
  };

  const onSuccessfulSave = (savedEmployee: Employee) => {
      setEmployees(currentEmployees => {
        const existingIndex = currentEmployees.findIndex(e => e.id === savedEmployee.id);
        if (existingIndex > -1) {
            // Update
            const newEmployees = [...currentEmployees];
            newEmployees[existingIndex] = savedEmployee;
            return newEmployees;
        } else {
            // Create
            return [...currentEmployees, savedEmployee].sort((a, b) => a.name.localeCompare(b.name));
        }
      });
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
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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
                  <TableHead>Biometric</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areEmployeesLoading ? (
                   <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          <span>Loading staff data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : error ? (
                   <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-destructive">
                        <p className="font-bold">Failed to load staff data.</p>
                        <p className="text-sm mt-1">{error}</p>
                      </TableCell>
                    </TableRow>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell><span className="font-medium">{employee.name}</span></TableCell>
                      <TableCell className="text-muted-foreground">{employee.id}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="font-medium">{employee.ticketBalance || 0}</TableCell>
                      <TableCell>{employee.biometricTemplate ? 'Enrolled' : 'Not Enrolled'}</TableCell>
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
                                  <AlertDialogAction onClick={() => handleDelete(employee)} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Continue
                                  </AlertDialogAction>
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
                      <TableCell colSpan={6} className="h-24 text-center">
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
