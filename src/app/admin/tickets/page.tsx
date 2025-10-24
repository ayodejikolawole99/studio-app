
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import type { Employee } from '@/lib/types';
import IndividualTicketControl from '@/components/individual-ticket-control';
import BulkTicketControl from '@/components/bulk-ticket-control';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


export default function TicketsPage() {
  const { toast } = useToast();
  const [isUpdating, startUpdateTransition] = useTransition();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/employees/list");
         if (!res.ok) {
           const errorData = await res.json().catch(() => ({ error: 'Failed to fetch employees. The API route might be missing or crashing.' }));
           throw new Error(errorData.error);
        }
        
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        } else {
          throw new Error(data.error || "Failed to parse employee data.");
        }
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        if (err.message.includes("JSON")) {
            setError("The server returned an invalid response. The API route might be missing or failing.");
        } else {
            setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  const departments = useMemo(() => {
    if (!employees) return [];
    const uniqueDepartments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    return uniqueDepartments.sort();
  }, [employees]);

  const handleUpdate = (payload: { employeeId: string; amount: number } | { department: string; amount: number }) => {
    startUpdateTransition(async () => {
      try {
        const isIndividual = 'employeeId' in payload;
        const endpoint = isIndividual ? `/api/employees/update-balance` : '/api/employees/bulk-update-balance';
        
        let apiPayload;
        let successMessage: string;

        if (isIndividual) {
          const employee = employees.find(e => e.id === payload.employeeId);
          if (!employee) throw new Error("Employee not found");
          
          apiPayload = { employeeId: payload.employeeId, amount: payload.amount };
          successMessage = `Ticket balance for ${employee.name} updated.`;

        } else {
           apiPayload = { department: payload.department, amount: payload.amount };
           successMessage = `Ticket balance for the ${payload.department} department updated.`;
        }

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
        });

        const result = await response.json();

        if (response.ok) {
            toast({ title: 'Update Applied', description: successMessage });
            // Re-fetch employees to get the updated balances from the server
            const res = await fetch("/api/employees/list");
            const data = await res.json();
            if (data.success) {
              setEmployees(data.employees);
            }
        } else {
            throw new Error(result.error || 'Update failed');
        }

      } catch (e: any) {
        console.error("Error updating tickets:", e);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: e.message || 'Could not update ticket balance.'
        });
      }
    });
  };
  
  const handleIndividualUpdate = (employeeId: string, amount: number) => {
    handleUpdate({ employeeId, amount });
  };
  
  const handleBulkUpdate = (department: string, amount: number) => {
     handleUpdate({ department, amount });
  };

  if (isLoading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading employee data...</p>
        </div>
    );
  }

  if (error) {
     return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Employee Data</AlertTitle>
                <AlertDescription>
                    {error}
                    <p className='mt-2 text-xs text-destructive/80'>This usually happens if the server-side API is missing credentials or has crashed. Please ensure Firebase Admin secrets are set correctly in your hosting environment.</p>
                </AlertDescription>
            </Alert>
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
