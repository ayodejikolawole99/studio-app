
'use client';

import { useState, useMemo } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { mockEmployees } from '@/lib/data';

export default function TicketsPage() {
  const { toast } = useToast();
  
  // Use local mock data
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [areEmployeesLoading, setAreEmployeesLoading] = useState(false);

  const departments = useMemo(() => {
    if (!employees) return [];
    const uniqueDepartments = [...new Set(employees.map(e => e.department))];
    return uniqueDepartments.sort();
  }, [employees]);

  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    let updatedEmployee: Employee | undefined;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
        updatedEmployee = { ...emp, ticketBalance: newBalance };
        return updatedEmployee;
      }
      return emp;
    }));

    if (updatedEmployee) {
        toast({
          title: 'Update Applied',
          description: `Ticket balance for ${updatedEmployee.name} updated to ${updatedEmployee.ticketBalance}. (Local change)`
        });
    }
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
    const employeesToUpdate = department === 'all'
        ? employees
        : employees.filter(emp => emp.department === department);
    
    if (employeesToUpdate.length === 0 && department !== 'all') {
      toast({
        variant: 'destructive',
        title: 'No Employees Found',
        description: `No employees found in the ${department} department.`
      });
      return;
    }

    setEmployees(prev => prev.map(emp => {
      if (department === 'all' || emp.department === department) {
        const newBalance = Math.max(0, (emp.ticketBalance || 0) + amount);
        return { ...emp, ticketBalance: newBalance };
      }
      return emp;
    }));
    
    toast({
      title: 'Bulk Update Applied',
      description: `Ticket balance updates applied for ${department === 'all' ? 'all employees' : `the ${department} department`}. (Local change)`
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
