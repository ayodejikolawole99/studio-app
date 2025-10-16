'use client';

import { useState, useMemo, useRef } from 'react';
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
import { MoreHorizontal, PlusCircle, Search, Upload } from 'lucide-react';
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
import { employees as mockEmployees } from '@/lib/data'; // Using mock data
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';


export default function StaffList() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


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
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    toast({ title: 'Success', description: 'Employee removed from mock data.'});
  };

  const handleSave = (employeeData: Employee, isNew: boolean) => {
    if (isNew) {
      if (employees.some(e => e.id === employeeData.id)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Employee ID must be unique.' });
        return;
      }
      setEmployees(prev => [...prev, employeeData]);
    } else {
      setEmployees(prev => prev.map(e => e.id === employeeData.id ? employeeData : e));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Skip header row if it exists
        const dataRows = json.length > 0 && json[0].join(',').toLowerCase().includes('employee') ? json.slice(1) : json;

        const newEmployees: Employee[] = [];
        const existingIds = new Set(employees.map(emp => emp.id));
        
        for (const row of dataRows) {
            if (row.length < 3 || !row[0] || !row[1] || !row[2]) continue;

            const [name, id, department] = row;
            if (existingIds.has(id)) {
                console.warn(`Skipping duplicate employee ID: ${id}`);
                continue;
            }

            newEmployees.push({
                id: id.trim(),
                name: name.trim(),
                department: department.trim(),
                ticketBalance: 0,
            });
            existingIds.add(id);
        }

        if (newEmployees.length > 0) {
            setEmployees(prev => [...prev, ...newEmployees]);
            toast({
                title: 'Upload Successful',
                description: `${newEmployees.length} new employees have been added.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'No new employees were found in the file, or all employees already exist.',
            });
        }

      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Could not parse the CSV file. Please check the format.',
        });
      } finally {
        // Reset file input to allow re-uploading the same file
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Staff</CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Button onClick={handleUploadClick} variant="outline">
                <Upload className="mr-2" />
                Upload CSV
              </Button>
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
              {filteredEmployees.map((employee) => (
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
                                employee account and remove their data from our servers.
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
               {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No staff members found.
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
        onSave={handleSave} 
      />
    </>
  );
}
