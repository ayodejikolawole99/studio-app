'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import { employees } from '@/lib/data';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"

export default function AuthenticationPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleScan = () => {
    if (!selectedEmployeeId) {
       toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please select an employee before scanning.",
      });
      return;
    }
    
    setIsScanning(true);
    setIsAuthenticated(false);

    // Simulate biometric scan
    setTimeout(() => {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      if (!employee) {
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: "Employee not found.",
        });
        return;
      }
      
      // On successful scan
      setIsScanning(false);
      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${employee.name}. Redirecting to your ticket...`,
      });

      const ticketData = {
        ticketId: `T-${Date.now()}`,
        employeeName: employee.name,
        employeeAvatarUrl: employee.avatarUrl,
        timestamp: new Date().toISOString(),
      };

      // Redirect to the ticket page with ticket data
      setTimeout(() => {
        const params = new URLSearchParams({
            ticket: JSON.stringify(ticketData),
        });
        router.push(`/ticket?${params.toString()}`);
      }, 1500);

    }, 1500);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <header className="mb-8 text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Canteen Tracker
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                Please authenticate to generate your meal ticket.
                </p>
            </header>
            <BiometricScanner
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={setSelectedEmployeeId}
                onScan={handleScan}
                isScanning={isScanning}
                isAuthenticated={isAuthenticated}
            />
        </div>
    </main>
  );
}
