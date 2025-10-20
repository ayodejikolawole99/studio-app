
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { employees as mockEmployees } from '@/lib/data';

export default function TicketsPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [areEmployeesLoading, setAreEmployeesLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
        setEmployees(mockEmployees);
        setAreEmployeesLoading(false);
    }, 500);
  }, []);

  const departments = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(e => e.department))];
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    if (!employees) return;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const newBalance = Math.max(0, (employee.ticketBalance || 0) + amount);
    
    setEmployees(prev => prev!.map(e => e.id === employeeId ? { ...e, ticketBalance: newBalance } : e));

    toast({
      title: 'Success (Local)',
      description: `Ticket balance for ${employee?.name} is now ${newBalance}. (This is not saved).`
    });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    if (!employees) return;

    const employeesToUpdate = department === 'all'
        ? employees
        : employees.filter(emp => emp.department === department);

    setEmployees(prev => prev!.map(emp => {
      if (employeesToUpdate.find(e => e.id === emp.id)) {
        const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
        return { ...emp, ticketBalance: newBalance };
      }
      return emp;
    }));
    
    toast({
      title: 'Success (Local)',
      description: `Ticket balance updates applied for ${department === 'all' ? 'all employees' : `the ${department} department`}. (This is not saved).`
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
