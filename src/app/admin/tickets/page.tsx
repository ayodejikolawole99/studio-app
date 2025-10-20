'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


export default function TicketsPage() {
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const employeesCollection = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  
  const { data: employees, isLoading } = useCollection<Employee>(employeesCollection);

  const departments = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(e => e.department))];
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    if (!firestore || !employees) return;

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
    
    const employeeRef = doc(firestore, 'employees', employeeId);
    updateDocumentNonBlocking(employeeRef, { ticketBalance: newBalance });

    toast({
      title: 'Success',
      description: `Ticket balance update initiated for ${employee.name}.`
    });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
     if (!firestore || !employees) return;

    const employeesToUpdate = department === 'all'
      ? employees
      : employees.filter(emp => emp.department === department);

    employeesToUpdate.forEach(emp => {
      const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
      const employeeRef = doc(firestore, 'employees', emp.id);
      updateDocumentNonBlocking(employeeRef, { ticketBalance: newBalance });
    });

    toast({
      title: 'Success',
      description: `Ticket balance updates initiated for ${department === 'all' ? 'all employees' : `the ${department} department`}.`
    });
  };

  if (isLoading) {
    return <div>Loading employee data...</div>
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
