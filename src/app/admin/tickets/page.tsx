
'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query as firestoreQuery, where, increment } from 'firebase/firestore';


// NOTE: This client-side implementation for ticket updates WILL FAIL with the new, stricter
// security rules unless the currently authenticated user is an ADMIN. The rules prevent
// direct client-side writes to the `employees` collection by non-admins.
// For this to work for all admins, they must have the `admin: true` custom claim set.

export default function TicketsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isUpdating, startUpdateTransition] = useTransition();

  const employeesRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  const { data: employees, isLoading: areEmployeesLoading, error } = useCollection<Employee>(employeesRef);


  const departments = useMemo(() => {
    if (!employees) return [];
    const uniqueDepartments = [...new Set(employees.map(e => e.department))];
    return uniqueDepartments.sort();
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    if (!firestore || !employees) return;
    
    startUpdateTransition(async () => {
      try {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) throw new Error("Employee not found");
        
        const employeeRef = doc(firestore, 'employees', employeeId);
        // Using increment for atomic update
        await writeBatch(firestore).update(employeeRef, { ticketBalance: increment(amount) }).commit();
        
        toast({
          title: 'Update Applied',
          description: `Ticket balance for ${employee.name} updated.`
        });
      } catch (e: any) {
        console.error("Error updating individual tickets:", e);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: e.message || 'Could not update ticket balance. You may not have permission.'
        });
      }
    });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    if (!firestore) return;
    
    startUpdateTransition(async () => {
      try {
        let collectionRef = collection(firestore, "employees");
        let q = department === 'all' ? collectionRef : firestoreQuery(collectionRef, where("department", "==", department));
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty && department !== 'all') {
            toast({ variant: 'destructive', title: 'No Employees Found', description: `No employees found in the ${department} department.` });
            return;
        }
        
        const batch = writeBatch(firestore);
        querySnapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { ticketBalance: increment(amount) });
        });

        await batch.commit();
        
        toast({
            title: 'Bulk Update Applied',
            description: `Ticket balances updated for ${department === 'all' ? 'all employees' : `the ${department} department`}.`
        });
      } catch (e: any) {
        console.error("Error performing bulk update:", e);
        toast({ 
          variant: 'destructive', 
          title: 'Bulk Update Failed', 
          description: e.message || 'Could not update ticket balances. You may not have permission.' 
        });
      }
    });
  };

  if (areEmployeesLoading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading employee data...</p>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col h-64 w-full items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
            <p className='font-bold'>Error Loading Employee Data</p>
            <p className='text-sm mt-2'>You may not have the required permissions to view the list of employees. Please contact your administrator to ensure you have the 'admin' role assigned to your account.</p>
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
          Allocate individual and bulk tickets to employees. Only users with an 'admin' role can perform these actions.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IndividualTicketControl 
          employees={employees || []} 
          onUpdate={handleIndividualUpdate}
          isUpdating={isUpdating}
        />
        <BulkTicketControl 
          departments={departments}
          onUpdate={handleBulkUpdate} 
          isUpdating={isUpdating}
        />
      </div>
    </>
  )
}
