'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { FeedingDataProvider } from '@/context/feeding-data-context';
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const employeesCollection = useMemoFirebase(() => 
    firestore ? collection(firestore, 'employees') : null
  , [firestore]);
  
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
    // In a real app, this would involve a call to a biometric verification service
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
      if (!firestore || !user) {
        setIsScanning(false);
        toast({ variant: "destructive", title: "Error", description: "System not ready. Please try again." });
        return;
      }
      
      setIsScanning(false);
      setIsAuthenticated(true);
      setAuthenticatedEmployee(randomEmployee);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${randomEmployee.name}. Generating your ticket...`,
      });
      
      // 1. Decrement ticket balance
      const newBalance = Math.max(0, (randomEmployee.ticketBalance || 0) - 1);
      const employeeRef = doc(firestore, 'employees', randomEmployee.id);
      updateDocumentNonBlocking(employeeRef, { ticketBalance: newBalance });

      // 2. Create a feeding record
      const feedingRecordData = {
        employeeId: randomEmployee.id,
        employeeName: randomEmployee.name,
        department: randomEmployee.department,
        timestamp: new Date(),
        mealType: "Lunch", // Example meal type
      };
      const feedingRecordsRef = collection(firestore, 'employees', randomEmployee.id, 'feedingRecords');
      addDocumentNonBlocking(feedingRecordsRef, feedingRecordData);
      
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
  // FeedingDataProvider is not needed here anymore, as data is fetched directly
  // It's still used on the dashboard, so we leave the component as is.
  return <AuthPageContent/>
}
