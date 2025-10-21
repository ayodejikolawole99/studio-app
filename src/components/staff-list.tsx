'use client';

import { useState, useTransition } from 'react';
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
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

export default function StaffList() {
  console.log('[Inspect][StaffList] Component rendered');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSearch = () => {
    console.log(`[Inspect][StaffList] handleSearch called with term: "${searchTerm}"`);
    if (!firestore) {
        console.error('[Inspect][StaffList] Firestore not available for search.');
        return;
    }
    startSearchTransition(async () => {
      try {
        const employeesRef = collection(firestore, 'employees');
        console.log(`[Inspect][StaffList] Creating query for name: '${searchTerm}'`);
        // Note: Firestore string queries are case-sensitive and match prefixes.
        // For a true "contains" or case-insensitive search, a more advanced setup like Algolia is needed.
        // This search finds names that start with the searchTerm.
        const q = query(employeesRef, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        console.log(`[Inspect][StaffList] Search found ${results.length} results:`, results);
        setSearchResults(results);
        if (results.length === 0) {
          toast({ title: 'No Results', description: 'No employees found with that name.' });
        }
      } catch (e) {
        console.error("[Inspect][StaffList] Error searching employees: ", e);
        const permissionError = new FirestorePermissionError({
            path: 'employees', 
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not perform search.' });
      }
    });
  }

  const handleAdd = () => {
    console.log('[Inspect][StaffList] handleAdd called');
    setSelectedEmployee(null);
    setEditOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    console.log('[Inspect][StaffList] handleEdit called for employee:', employee);
    setSelectedEmployee(employee);
    setEditOpen(true);
  };
  
  const handleDelete = (employeeId: string) => {
    console.log('[Inspect][StaffList] handleDelete called for employee ID:', employeeId);
    if (!firestore) {
        console.error('[Inspect][StaffList] Firestore not available for delete.');
        return;
    }
    const employeeRef = doc(firestore, 'employees', employeeId);
    // Also delete the biometric data
    const biometricRef = doc(firestore, 'biometrics', employeeId);

    Promise.all([deleteDoc(employeeRef), deleteDoc(biometricRef).catch(() => {})]) // Ignore error if biometric doesn't exist
      .then(() => {
        console.log(`[Inspect][StaffList] Employee ${employeeId} and their biometric data deleted. Refreshing search results.`);
        handleSearch();
        toast({ title: 'Success', description: 'Employee has been deleted.'});
      })
      .catch((error) => {
        console.error("[Inspect][StaffList] Error deleting employee: ", error);
        const permissionError = new FirestorePermissionError({
            path: employeeRef.path, 
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete employee.' });
      });
  };

  const handleSave = (employeeData: Employee, isNew: boolean) => {
    console.log(`[Inspect][StaffList] handleSave called. isNew: ${isNew}, data:`, employeeData);
    if (!firestore) {
        console.error('[Inspect][StaffList] Firestore not available for save.');
        return;
    }
    const employeeRef = doc(firestore, 'employees', employeeData.id);
    
    // The hasBiometric field is deprecated, so we don't save it.
    const saveData: Omit<Employee, 'id' | 'hasBiometric'> & {employeeId: string} = {
        name: employeeData.name,
        department: employeeData.department,
        ticketBalance: employeeData.ticketBalance,
        employeeId: employeeData.id // Ensure the employeeId is part of the document data
    };
    
    setDoc(employeeRef, saveData, { merge: !isNew })
      .then(() => {
        console.log(`[Inspect][StaffList] Employee ${employeeData.id} saved. Refreshing search results.`);
        handleSearch(); // Refresh search results
        toast({
            title: "Success",
            description: `Employee ${isNew ? 'added' : 'updated'} successfully.`,
        });
      })
      .catch((error) => {
         console.error("[Inspect][StaffList] Error saving employee: ", error);
         const permissionError = new FirestorePermissionError({
             path: employeeRef.path, 
             operation: isNew ? 'create' : 'update', 
             requestResourceData: saveData,
         });
         errorEmitter.emit('permission-error', permissionError);
         toast({ variant: 'destructive', title: 'Error', description: 'Could not save employee data.' });
      });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Staff Database</CardTitle>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2" />
              Add New Staff
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground pt-1">Note: Search is case-sensitive and finds names that start with the search term.</p>
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
                {isSearching ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                ) : searchResults.length > 0 ? (
                  searchResults.map((employee) => (
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
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the employee record and any associated biometric data.
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
                  ))
                ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Search for an employee to see results.
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
