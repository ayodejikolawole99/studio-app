'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { FirebaseClientProvider } from '@/firebase';

export default function AuthenticationPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const employeesCollection = useMemoFirebase(() =>
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesCollection);

  const handleScan = async () => {
    if (employeesLoading || !employees) {
        toast({ variant: "destructive", title: "System Busy", description: "Employee data is still loading. Please try again shortly." });
        return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // TODO: Integrate with SecuGen Hamster Plus SDK/WebAPI here.
    // The logic below is for demonstration and should be replaced with
    // actual biometric scanning and user identification from your database.

    // Simulate biometric scan and user identification
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
      employeeId: employee.id,
      department: employee.department,
      timestamp: new Date().toISOString(),
    };
    
    if(firestore) {
      const feedingRecordsRef = collection(firestore, 'feedingRecords');
      addDocumentNonBlocking(feedingRecordsRef, {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          timestamp: new Date(),
      });
    }

    // Redirect to the ticket page with ticket data
    const params = new URLSearchParams({
        ticket: JSON.stringify(ticketData),
    });
    router.push(`/ticket?${params.toString()}`);


    // On a failed scan, you would handle the error state:
    // setIsScanning(false);
    // setScanError(true);
    // toast({ variant: "destructive", title: "Authentication Failed" });

  };

  return (
    <FirebaseClientProvider>
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
    </FirebaseClientProvider>
  );
}
