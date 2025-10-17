'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { employees as mockEmployees } from '@/lib/data';


export default function TicketsPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isLoading, setIsLoading] = useState(false);

  const departments = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(e => e.department))];
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => {
        if (emp.id === employeeId) {
          const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
          return { ...emp, ticketBalance: newBalance };
        }
        return emp;
      })
    );
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    setEmployees(prevEmployees =>
        prevEmployees.map(emp => {
        if (department === 'all' || emp.department === department) {
            const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
            return { ...emp, ticketBalance: newBalance };
        }
        return emp;
        })
    );

    toast({
      title: 'Success',
      description: 'Ticket balances updated for mock data.'
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
