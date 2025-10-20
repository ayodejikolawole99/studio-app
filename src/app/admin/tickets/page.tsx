
'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';


export default function TicketsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const employeesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'employees');
  }, [firestore]);
  
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesCollection);

  const departments = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(e => e.department))];
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    if (!employees || !firestore) return;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
    const employeeDocRef = doc(firestore, 'employees', employeeId);
    
    updateDocumentNonBlocking(employeeDocRef, { ticketBalance: newBalance });

    toast({
      title: 'Success',
      description: `Ticket balance update sent for ${employee?.name}. New balance will be ${newBalance}.`
    });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    if (!employees || !firestore) return;

    const employeesToUpdate = department === 'all'
        ? employees
        : employees.filter(emp => emp.department === department);

    employeesToUpdate.forEach(employee => {
        const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
        const employeeDocRef = doc(firestore, 'employees', employee.id);
        updateDocumentNonBlocking(employeeDocRef, { ticketBalance: newBalance });
    });
    
    toast({
      title: 'Success',
      description: `Ticket balance updates applied for ${department === 'all' ? 'all employees' : `the ${department} department`}.`
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
