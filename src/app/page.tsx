
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { employees as mockEmployees } from '@/lib/data';

function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees); // Use state for employees
  const router = useRouter();
  const { toast } = useToast();
  const isLoading = false; // Data is local

  const handleScan = async () => {
    if (isLoading || !employees || employees.length === 0) {
      toast({ variant: "destructive", title: "System Not Ready", description: "Employee data is not loaded yet. Please wait." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // Simulate biometric scan and user identification
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    
    if ((randomEmployee.ticketBalance || 0) <= 0) {
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: `${randomEmployee.name} has no available tickets.`,
        });
        setIsScanning(false);
        return;
    }

    // On successful scan from the SecuGen device:
    setTimeout(async () => {
      setIsScanning(false);
      setIsAuthenticated(true);
      setAuthenticatedEmployee(randomEmployee);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${randomEmployee.name}. Generating your ticket...`,
      });
      
      // 1. Decrement ticket balance (locally)
      const newBalance = Math.max(0, (randomEmployee.ticketBalance || 0) - 1);
      setEmployees(prev => prev.map(e => e.id === randomEmployee.id ? {...e, ticketBalance: newBalance} : e));
      
      // 2. Create a feeding record (locally - this won't be persisted globally for now)
      console.log(`Feeding record for ${randomEmployee.name} created locally.`);
      
      // 3. Generate ticket data for the next page
      const ticketData = {
        ticketId: `T-${Date.now()}`,
        employeeName: randomEmployee.name,
        department: randomEmployee.department,
        timestamp: new Date().toISOString(),
      };

      const params = new URLSearchParams({
          ticket: JSON.stringify(ticketData),
      });
      router.push(`/ticket?${params.toString()}`);
    }, 1500); // Simulate scanning delay
  };

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
