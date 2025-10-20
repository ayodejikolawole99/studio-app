
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react';
import { mockEmployees } from '@/lib/data';

function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [employees, setEmployees] = useState(mockEmployees);
  const [areEmployeesLoading, setAreEmployeesLoading] = useState(false);


  const handleScan = async () => {
    if (areEmployeesLoading || !employees || employees.length === 0) {
      toast({ variant: "destructive", title: "System Not Ready", description: "Employee data is not loaded yet. Please wait." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real scenario, you'd get the employeeId from the biometric scanner API.
    // Here, we simulate by picking a random employee who has a ticket balance.
    const eligibleEmployees = employees.filter(e => e.ticketBalance > 0);
    if (eligibleEmployees.length === 0) {
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: "No employees have available tickets.",
        });
        return;
    }
    
    const randomEmployee = eligibleEmployees[Math.floor(Math.random() * eligibleEmployees.length)];
    const employeeId = randomEmployee.id;

    try {
        // Simulate a transaction: decrement ticket and create record
        let updatedEmployee: Employee | null = null;
        setEmployees(prev => prev.map(emp => {
            if (emp.id === employeeId) {
                updatedEmployee = { ...emp, ticketBalance: emp.ticketBalance - 1 };
                return updatedEmployee;
            }
            return emp;
        }));

        if (!updatedEmployee) {
            throw new Error("Failed to find and update employee locally.");
        }

        const ticketId = `TICKET-${Date.now()}`;

        setIsScanning(false);
        setIsAuthenticated(true);
        setAuthenticatedEmployee(updatedEmployee);

        toast({
            title: "Authentication Successful",
            description: `Welcome, ${updatedEmployee.name}. Generating your ticket...`,
        });
            
        const ticketDataForPage = {
            ticketId: ticketId,
            employeeName: updatedEmployee.name,
            department: updatedEmployee.department,
            timestamp: new Date().toISOString(), // Use current client time for immediate display
        };

        const params = new URLSearchParams({
            ticket: JSON.stringify(ticketDataForPage),
        });
        router.push(`/ticket?${params.toString()}`);

    } catch (error: any) {
        setIsScanning(false);
        console.error("Local transaction failed: ", error);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };

  if (areEmployeesLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading employee data...</p>
        </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 bg-background/50"
      ></div>
       <div 
        className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10"
        style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
      ></div>
      <main 
        className="min-h-screen flex items-center justify-center bg-transparent p-4"
      >
          <div className="w-full max-w-md">
              <header className="mb-8 text-center bg-background/80 backdrop-blur-sm p-4 rounded-xl">
                  <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Canteen Biometric
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                  Please scan your fingerprint to generate your meal ticket.
                  </p>
              </header>
              <BiometricScanner
                  onScan={handleScan}
                  isScanning={isScanning}
                  isAuthenticated={isAuthenticated}
                  authenticatedEmployee={authenticatedEmployee}
              />
          </div>
      </main>
    </>
  );
}

export default function AuthenticationPage() {
  return <AuthPageContent/>
}
