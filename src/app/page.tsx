'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

function AuthPageContent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const employeesRef = useMemoFirebase(() => firestore ? collection(firestore, 'employees') : null, [firestore]);
  const { data: employees, isLoading: areEmployeesLoading } = useCollection<Employee>(employeesRef);


  const handleScan = async () => {
    if (areEmployeesLoading || !employees || employees.length === 0 || !firestore) {
      toast({ variant: "destructive", title: "System Not Ready", description: "Employee data is not loaded yet. Please wait." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    // In a real scenario, you'd get the employeeId from the biometric scanner API.
    // Here, we simulate by picking a random employee.
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const employeeId = randomEmployee.id;

    try {
        // Use a transaction to ensure atomic read/write of ticket balance and record creation
        await runTransaction(firestore, async (transaction) => {
            const employeeDocRef = doc(firestore, "employees", employeeId);
            const employeeDoc = await transaction.get(employeeDocRef);

            if (!employeeDoc.exists()) {
                throw new Error("Employee not found in database.");
            }

            const currentBalance = employeeDoc.data().ticketBalance;

            if (currentBalance <= 0) {
                throw new Error(`${employeeDoc.data().name} has no available tickets.`);
            }

            // 1. Decrement ticket balance
            const newBalance = currentBalance - 1;
            transaction.update(employeeDocRef, { ticketBalance: newBalance });

            // 2. Create a new feeding record
            const feedingRecordRef = doc(collection(firestore, "feedingRecords"));
            transaction.set(feedingRecordRef, {
                employeeId: employeeId,
                employeeName: employeeDoc.data().name,
                department: employeeDoc.data().department,
                timestamp: serverTimestamp(),
            });
            
            // This data is passed to the next page
            return {
                employeeData: employeeDoc.data() as Employee,
                ticketId: feedingRecordRef.id,
            };
        }).then(result => {
             // This block runs if the transaction was successful
            setIsScanning(false);
            setIsAuthenticated(true);
            setAuthenticatedEmployee({ ...result.employeeData, id: employeeId });

            toast({
                title: "Authentication Successful",
                description: `Welcome, ${result.employeeData.name}. Generating your ticket...`,
            });
             
            const ticketDataForPage = {
                ticketId: result.ticketId,
                employeeName: result.employeeData.name,
                department: result.employeeData.department,
                timestamp: new Date().toISOString(), // Use current client time for immediate display
            };

            const params = new URLSearchParams({
                ticket: JSON.stringify(ticketDataForPage),
            });
            router.push(`/ticket?${params.toString()}`);
        });

    } catch (error: any) {
        setIsScanning(false);
        console.error("Transaction failed: ", error);
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
