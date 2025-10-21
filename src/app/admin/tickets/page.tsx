'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query as firestoreQuery, where } from 'firebase/firestore';

export default function TicketsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const employeesRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesRef);


  const departments = useMemo(() => {
    if (!employees) return [];
    const uniqueDepartments = [...new Set(employees.map(e => e.department))];
    return uniqueDepartments.sort();
  }, [employees]);

  const handleIndividualUpdate = async (employeeId: string, amount: number) => {
    if (!firestore) return;
    const employee = employees?.find(e => e.id === employeeId);
    if (!employee) return;

    try {
      const batch = writeBatch(firestore);
      const employeeRef = doc(firestore, 'employees', employeeId);
      const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
      batch.update(employeeRef, { ticketBalance: newBalance });
      await batch.commit();

      toast({
        title: 'Update Applied',
        description: `Ticket balance for ${employee.name} updated to ${newBalance}.`
      });
    } catch (error) {
      console.error('Error updating individual ticket balance:', error);
      const { FirestorePermissionError, errorEmitter } = await import('@/firebase');
      const permissionError = new FirestorePermissionError({
          path: `employees/${employeeId}`,
          operation: 'update',
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
    if (!firestore) return;
    
    try {
        const batch = writeBatch(firestore);
        let collectionRef = collection(firestore, "employees");
        let q;

        if (department === 'all') {
            q = collectionRef;
        } else {
            q = firestoreQuery(collectionRef, where("department", "==", department));
        }

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty && department !== 'all') {
             toast({
                variant: 'destructive',
                title: 'No Employees Found',
                description: `No employees found in the ${department} department.`
            });
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
            description: `Ticket balance updates applied for ${department === 'all' ? 'all employees' : `the ${department} department`}.`
        });
    } catch (error) {
        console.error('Error performing bulk update:', error);
        const { FirestorePermissionError, errorEmitter } = await import('@/firebase');
        const permissionError = new FirestorePermissionError({
            path: 'employees',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Bulk Update Failed',
            description: 'Could not update ticket balances. Check permissions.'
        });
    }
  };

  if (areEmployeesLoading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading employee data...</p>
        </div>
    );
  }

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
