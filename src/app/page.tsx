'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import { employees } from '@/lib/data';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"

export default function AuthenticationPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleScan = () => {
    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // TODO: Integrate with SecuGen Hamster Plus SDK/WebAPI here.
    // The logic below is for demonstration and should be replaced with
    // actual biometric scanning and user identification from your database.

    // Simulate biometric scan and user identification
    setTimeout(() => {
      // In a real scenario, the biometric scanner would return the identified user.
      // Here, we'll just pick a random employee to simulate a successful scan.
      const employee = employees[Math.floor(Math.random() * employees.length)];
      
      // On successful scan from the SecuGen device:
      setIsScanning(false);
      setIsAuthenticated(true);
      setAuthenticatedEmployee(employee);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${employee.name}. Generating your ticket...`,
      });

      const ticketData = {
        ticketId: `T-${Date.now()}`,
        employeeName: employee.name,
        timestamp: new Date().toISOString(),
      };

      // Redirect to the ticket page with ticket data
      const params = new URLSearchParams({
          ticket: JSON.stringify(ticketData),
      });
      router.push(`/ticket?${params.toString()}`);


      // On a failed scan, you would handle the error state:
      // setIsScanning(false);
      // setScanError(true);
      // toast({ variant: "destructive", title: "Authentication Failed" });

    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <header className="mb-8 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Canteen Tracker
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
  );
}
