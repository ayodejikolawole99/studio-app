'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useCollection, useFirebase, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function TicketsPage() {
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

    const updatedEmployee = {
        ...employee,
        ticketBalance: Math.max(0, (employee.ticketBalance || 0) + amount)
    };
    const docRef = doc(firestore, 'employees', employeeId);
    setDocumentNonBlocking(docRef, updatedEmployee, { merge: true });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    if (!firestore || !employees) return;
    
    employees.forEach(emp => {
      if (department === 'all' || emp.department === department) {
        const updatedEmployee = {
          ...emp,
          ticketBalance: Math.max(0, (emp.ticketBalance || 0) + amount)
        };
        const docRef = doc(firestore, 'employees', emp.id);
        setDocumentNonBlocking(docRef, updatedEmployee, { merge: true });
      }
    });
  };
  
  if (isLoading) {
    return <p>Loading ticket management...</p>
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
