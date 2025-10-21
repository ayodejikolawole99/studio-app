'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, writeBatch, getDocs, query as firestoreQuery, where } from 'firebase/firestore';

export default function TicketsPage() {
  console.log('[Inspect][TicketsPage] Component rendered');
  const { toast } = useToast();
  const firestore = useFirestore();

  console.log('[Inspect][TicketsPage] Preparing to call useCollection for employees');
  const employeesRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  const { data: employees, isLoading: areEmployeesLoading, error } = useCollection<Employee>(employeesRef);
  console.log(`[Inspect][TicketsPage] useCollection result:`, { data: employees, isLoading: areEmployeesLoading, error });


  const departments = useMemo(() => {
    if (!employees) return [];
    const uniqueDepartments = [...new Set(employees.map(e => e.department))];
    return uniqueDepartments.sort();
  }, [employees]);

  const handleIndividualUpdate = async (employeeId: string, amount: number) => {
    console.log(`[Inspect][TicketsPage] handleIndividualUpdate called with:`, { employeeId, amount });
    if (!firestore || !employees) {
        console.error('[Inspect][TicketsPage] Firestore or employees not available for individual update.');
        return;
    }
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
        console.error(`[Inspect][TicketsPage] Employee with ID ${employeeId} not found.`);
        return;
    }

    try {
      const employeeRef = doc(firestore, 'employees', employeeId);
      const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
      console.log(`[Inspect][TicketsPage] Updating employee ${employeeId} with new balance: ${newBalance}`);
      await updateDoc(employeeRef, { ticketBalance: newBalance });

      toast({
        title: 'Update Applied',
        description: `Ticket balance for ${employee.name} updated.`
      });
    } catch (error) {
      console.error('[Inspect][TicketsPage] Error updating individual ticket balance:', error);
      const { FirestorePermissionError, errorEmitter } = await import('@/firebase');
      const permissionError = new FirestorePermissionError({
          path: `employees/${employeeId}`, operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update ticket balance. Check permissions.'
      });
    }
  };
  
  const handleBulkUpdate = async (department: string, amount: number) => {
    console.log(`[Inspect][TicketsPage] handleBulkUpdate called with:`, { department, amount });
    if (!firestore) {
        console.error('[Inspect][TicketsPage] Firestore not available for bulk update.');
        return;
    };
    
    try {
        const batch = writeBatch(firestore);
        let collectionRef = collection(firestore, "employees");
        let q = department === 'all' ? collectionRef : firestoreQuery(collectionRef, where("department", "==", department));
        
        console.log(`[Inspect][TicketsPage] Executing bulk update query for department: ${department}`);
        const querySnapshot = await getDocs(q);
        console.log(`[Inspect][TicketsPage] Bulk update query found ${querySnapshot.size} documents.`);

        if (querySnapshot.empty && department !== 'all') {
             toast({ variant: 'destructive', title: 'No Employees Found', description: `No employees found in the ${department} department.` });
            return;
        }
        
        querySnapshot.forEach((docSnap) => {
            const employee = docSnap.data() as Employee;
            const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
            batch.update(docSnap.ref, { ticketBalance: newBalance });
        });

        await batch.commit();

        toast({
            title: 'Bulk Update Applied',
            description: `Ticket balances updated for ${department === 'all' ? 'all employees' : `the ${department} department`}.`
        });
    } catch (error) {
        console.error('[Inspect][TicketsPage] Error performing bulk update:', error);
        const { FirestorePermissionError, errorEmitter } = await import('@/firebase');
        const permissionError = new FirestorePermissionError({
            path: 'employees', operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Bulk Update Failed', description: 'Could not update ticket balances. Check permissions.' });
    }
  };

  if (areEmployeesLoading) {
    console.log('[Inspect][TicketsPage] Rendering loading state...');
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading employee data...</p>
        </div>
    );
  }

  if (error) {
     console.error('[Inspect][TicketsPage] Rendering error state:', error);
     return (
        <div className="flex h-64 w-full items-center justify-center text-destructive">
            <p>Error loading employees. The database connection is failing. Please check console.</p>
        </div>
    );
  }

  console.log('[Inspect][TicketsPage] Rendering main content.');
  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ticket Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Allocate individual and bulk tickets to employees.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IndividualTicketControl 
          employees={employees || []} 
          onUpdate={handleIndividualUpdate}
        />
        <BulkTicketControl 
          departments={departments}
          onUpdate={handleBulkUpdate} 
        />
      </div>
    </>
  )
}
