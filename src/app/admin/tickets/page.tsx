
'use client';

import { useState } from 'react';
import { employees as initialEmployees } from '@/lib/data';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';

export default function TicketsPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
        ? { ...emp, ticketBalance: Math.max(0, emp.ticketBalance + amount) } 
        : emp
      )
    );
  };
  
  const handleBulkUpdate = (amount: number) => {
    setEmployees(prev => 
      prev.map(emp => 
        ({ ...emp, ticketBalance: Math.max(0, emp.ticketBalance + amount) })
      )
    );
  };

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
          employees={employees} 
          onUpdate={handleIndividualUpdate}
        />
        <BulkTicketControl onUpdate={handleBulkUpdate} />
      </div>
    </>
  )
}
