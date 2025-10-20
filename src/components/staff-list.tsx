
'use client';

import { useState, useMemo } from 'react';
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
import { MoreHorizontal, PlusCircle, Search, Loader2 } from 'lucide-react';
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
import { mockEmployees } from '@/lib/data';


export default function StaffList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  
  // Use local mock data
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isLoading, setIsLoading] = useState(false);


  const filteredEmployees = useMemo(() => {
      if (!employees) return [];
      return employees.filter((employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchTerm]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setEditOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditOpen(true);
  };
  
  const handleDelete = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({ title: 'Success', description: 'Employee has been deleted from local view.'});
  };

  const handleSave = (employeeData: Employee, isNew: boolean) => {
    if (isNew) {
      // Check if employee ID already exists
      if (employees.some(e => e.id === employeeData.id)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee with this ID already exists.",
        });
        return;
      }
      setEmployees(prev => [employeeData, ...prev]);
    } else {
      setEmployees(prev => prev.map(emp => emp.id === employeeData.id ? employeeData : emp));
    }

    toast({
        title: "Success",
        description: `Employee ${isNew ? 'added' : 'updated'} in local view. Changes are not saved.`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Staff</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>
                <PlusCircle className="mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or department..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading staff...</p>
            </div>
          ) : (
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
                {filteredEmployees && filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <span className="font-medium">{employee.name}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.id}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="font-medium">{employee.ticketBalance || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>
                            Edit
                          </DropdownMenuItem>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  employee record from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(employee.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredEmployees || filteredEmployees.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <StaffEditDialog 
        isOpen={isEditOpen} 
        setIsOpen={setEditOpen} 
        employee={selectedEmployee} 
        onSave={handleSave} 
      />
    </>
  );
}
