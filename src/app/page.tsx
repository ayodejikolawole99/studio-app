'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { employees as mockEmployees } from '@/lib/data';
import { useFeedingData } from '@/context/feeding-data-context'; // Assuming this context exists and is provided at a higher level
import { FeedingDataProvider } from '@/context/feeding-data-context';

function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { addMockRecord } = useFeedingData();

  const handleScan = async () => {
    if (!mockEmployees || mockEmployees.length === 0) {
      toast({ variant: "destructive", title: "No Employees Found", description: "Please add employees to the mock data file." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // Simulate biometric scan and user identification
    const employee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
    
    // On successful scan from the SecuGen device:
    setTimeout(() => {
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
        department: employee.department,
        timestamp: new Date().toISOString(),
      };
      
      // We'll call a function to add a record to our new mock context
      addMockRecord();

      // Redirect to the ticket page with ticket data
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
  return (
    <FeedingDataProvider>
      <AuthPageContent/>
    </FeedingDataProvider>
  )
}
