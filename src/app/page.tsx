'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { useFirestore } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, limit, increment } from 'firebase/firestore';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

function AuthPageContent() {
  console.log('[Inspect][AuthPage] Component rendered');
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleScan = async () => {
    console.log(`[Inspect][AuthPage] handleScan initiated`);
    
    if (!firestore) {
      console.error('[Inspect][AuthPage] Firestore not available for scan.');
      toast({ variant: "destructive", title: "System Not Ready", description: "Database is not connected." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    try {
      console.log('[Inspect][AuthPage] Simulating biometric scan and fetching enrolled employee...');
      // In a real app, the scanner would return a unique identifier for the fingerprint.
      // Here, we simulate this by querying for one enrolled employee to authenticate.
      const employeesRef = collection(firestore, 'employees');
      const q = query(employeesRef, where("biometricTemplate", "!=", null), limit(1));
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "No enrolled employees found in the system." });
        setIsScanning(false);
        return;
      }

      const employeeDoc = querySnapshot.docs[0];
      const employeeData = { ...employeeDoc.data(), id: employeeDoc.id } as Employee;
      const employeeRef = doc(firestore, 'employees', employeeData.id);

      console.log(`[Inspect][AuthPage] Matched employee:`, employeeData);
      
      if ((employeeData.ticketBalance || 0) <= 0) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "You have no meal tickets left." });
        setIsScanning(false);
        return;
      }

      console.log('[Inspect][AuthPage] Biometric match found. Proceeding with ticket generation.');
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use the atomic increment operation
      const updateData = { ticketBalance: increment(-1) };
      const newBalance = (employeeData.ticketBalance || 0) - 1;
      
      console.log(`[Inspect][AuthPage] Initiating non-blocking update for ticket balance to ${newBalance}`);
      updateDoc(employeeRef, updateData).catch(async (serverError) => {
          console.error(`[Inspect][AuthPage] Firestore error during ticket balance update:`, serverError);
          const permissionError = new FirestorePermissionError({
              path: employeeRef.path, operation: 'update', requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      console.log(`[Inspect][AuthPage] Initiating non-blocking creation of feeding record.`);
      const feedingRecordRef = collection(firestore, 'feedingRecords');
      const newFeedingRecord = {
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        department: employeeData.department,
        timestamp: serverTimestamp()
      };
      addDoc(feedingRecordRef, newFeedingRecord).catch(async (serverError) => {
          console.error(`[Inspect][AuthPage] Firestore error during feeding record creation:`, serverError);
          const permissionError = new FirestorePermissionError({
              path: feedingRecordRef.path, operation: 'create', requestResourceData: newFeedingRecord,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      const updatedEmployee: Employee = { ...employeeData, ticketBalance: newBalance };
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
          timestamp: new Date().toISOString(),
      };

      const params = new URLSearchParams({ ticket: JSON.stringify(ticketDataForPage) });
      console.log(`[Inspect][AuthPage] Navigating to ticket page.`);
      router.push(`/ticket?${params.toString()}`);

    } catch (error: any) {
        console.error(`[Inspect][AuthPage] Error during handleScan:`, error);
        setIsScanning(false);
        // Since we don't have a specific employee ID at the start, we can't create a detailed error path
        const permissionError = new FirestorePermissionError({
            path: `employees`, operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not verify employee. Check permissions or network.",
        });
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-background/50"></div>
       <div 
        className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10"
        style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
      ></div>
      <main className="min-h-screen flex items-center justify-center bg-transparent p-4">
          <div className="w-full max-w-md">
              <header className="mb-8 text-center bg-background/80 backdrop-blur-sm p-4 rounded-xl">
                  <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Canteen Biometric
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    Scan your fingerprint to generate a meal ticket.
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
