'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { useFeedingData } from '@/context/feeding-data-context';
import { FeedingDataProvider } from '@/context/feeding-data-context';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';


function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { addMockRecord } = useFeedingData();
  const { firestore } = useFirebase();

  const employeesCollection = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null,
  [firestore]);
  const { data: employees, isLoading } = useCollection<Employee>(employeesCollection);

  const handleScan = async () => {
    if (isLoading || !employees || employees.length === 0) {
      toast({ variant: "destructive", title: "System Not Ready", description: "Employee data is not loaded yet. Please wait." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // Simulate biometric scan and user identification
    const employee = employees[Math.floor(Math.random() * employees.length)];
    
    if (employee.ticketBalance <= 0) {
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: `${employee.name} has no available tickets.`,
        });
        setIsScanning(false);
        return;
    }


    // On successful scan from the SecuGen device:
    setTimeout(async () => {
      if (!firestore) return;
      
      setIsScanning(false);
      setIsAuthenticated(true);
      setAuthenticatedEmployee(employee);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${employee.name}. Generating your ticket...`,
      });

      // We'll call a function to add a record to our new mock context
      addMockRecord();

      // Decrement ticket balance in Firestore
      const employeeRef = doc(firestore, 'employees', employee.id);
      await updateDoc(employeeRef, {
        ticketBalance: Math.max(0, employee.ticketBalance - 1)
      });


      const ticketData = {
        ticketId: `T-${Date.now()}`,
        employeeName: employee.name,
        department: employee.department,
        timestamp: new Date().toISOString(),
      };

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
