'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/types';
import BiometricScanner from '@/components/biometric-scanner';
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

function AuthPageContent() {
  console.log('[Inspect][AuthPage] Component rendered');
  const [employeeId, setEmployeeId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleScan = async () => {
    console.log(`[Inspect][AuthPage] handleScan called for employee ID: ${employeeId}`);
    if (!employeeId) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter your Employee ID." });
      return;
    }
    if (!firestore) {
      console.error('[Inspect][AuthPage] Firestore not available for scan.');
      toast({ variant: "destructive", title: "System Not Ready", description: "Database is not connected." });
      return;
    }

    setIsScanning(true);
    setIsAuthenticated(false);
    setAuthenticatedEmployee(null);

    try {
      console.log(`[Inspect][AuthPage] Getting document for employee: employees/${employeeId}`);
      const employeeRef = doc(firestore, 'employees', employeeId);
      const biometricRef = doc(firestore, 'biometrics', employeeId);

      const [employeeSnap, biometricSnap] = await Promise.all([
        getDoc(employeeRef),
        getDoc(biometricRef)
      ]);
      
      console.log(`[Inspect][AuthPage] Document snapshot received. Employee Exists: ${employeeSnap.exists()}, Biometric Exists: ${biometricSnap.exists()}`);

      if (!employeeSnap.exists()) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "Employee ID not found." });
        setIsScanning(false);
        return;
      }
      
      const employeeData = { ...employeeSnap.data(), id: employeeSnap.id } as Employee;
      console.log(`[Inspect][AuthPage] Employee data:`, employeeData);

      if (!biometricSnap.exists()) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "No biometric data found for this employee." });
        setIsScanning(false);
        return;
      }

      if ((employeeData.ticketBalance || 0) <= 0) {
        toast({ variant: "destructive", title: "Authentication Failed", description: "You have no meal tickets left." });
        setIsScanning(false);
        return;
      }

      console.log('[Inspect][AuthPage] Simulating biometric scan...');
      // In a real app, you'd use the template from biometricSnap.data() 
      // and compare it with the scanner output.
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBalance = (employeeData.ticketBalance || 0) - 1;
      const updateData = { ticketBalance: newBalance };
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
        // This could be a 'get' on either 'employees' or 'biometrics'
        const permissionError = new FirestorePermissionError({
            path: `employees/${employeeId}`, operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not verify employee. Check permissions or employee ID.",
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
                    Enter your ID and scan your fingerprint to generate a meal ticket.
                  </p>
              </header>
              <div className="space-y-4 mb-4">
                <Input 
                  type="text"
                  placeholder="Enter Your Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="text-center text-lg h-12"
                />
              </div>
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
