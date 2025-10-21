'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEffect, useState, useTransition } from 'react';
import type { Employee } from '@/lib/types';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FirestorePermissionError, errorEmitter } from '@/firebase';
import { createEmployee } from '@/ai/flows/create-employee-flow';
import { z } from 'zod';

const CreateEmployeeInputSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  ticketBalance: z.number(),
  biometricTemplate: z.string().optional(),
});

type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;


const departments = ["Production", "Logistics", "Quality Assurance", "Human Resources", "Maintenance", "IT", "Finance"];

interface StaffEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  employee: Employee | null;
  onSaveSuccess: () => void;
}

export function StaffEditDialog({
  isOpen,
  setIsOpen,
  employee,
  onSaveSuccess,
}: StaffEditDialogProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [biometricTemplate, setBiometricTemplate] = useState<string | undefined>(undefined);
  const [isScanning, startBiometricScan] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    if (isOpen && employee) {
      const isNew = !employee.id;
      setIsNewEmployee(isNew);
      setName(employee.name || '');
      setEmployeeId(employee.employeeId || '');
      setDepartment(employee.department || '');
      setBiometricTemplate(employee.biometricTemplate);
    } else if (!isOpen) {
      setName('');
      setEmployeeId('');
      setDepartment('');
      setBiometricTemplate(undefined);
      setIsNewEmployee(false);
    }
  }, [isOpen, employee]);

  const handleBiometricScan = () => {
    startBiometricScan(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const simulatedTemplate = `B64_TEMPLATE_${employeeId || 'NEW'}_${Date.now()}`;
      setBiometricTemplate(simulatedTemplate);
      toast({
        title: "Biometric Scan Successful",
        description: "Fingerprint data has been captured. Save the employee to store it.",
      });
    });
  };

  const handleSave = () => {
     startSaving(async () => {
        if (!name || !employeeId || !department) {
            toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all fields, including Employee Number." });
            return;
        }
        if (!firestore && !isNewEmployee) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database connection not available.' });
            return;
        }

        try {
            if (isNewEmployee) {
                // Use the server-side flow to create the employee
                const newEmployeeData: CreateEmployeeInput = {
                    name,
                    department,
                    employeeId,
                    biometricTemplate: biometricTemplate,
                    ticketBalance: 0,
                };
                const result = await createEmployee(newEmployeeData);

                if (result.success) {
                    toast({
                        title: "Success",
                        description: `Employee ${result.id} added successfully.`,
                    });
                    onSaveSuccess();
                } else {
                    toast({
                        variant: "destructive",
                        title: "Creation Failed",
                        description: result.error || "An unknown error occurred.",
                    });
                }
            } else {
                // Use standard client-side update for existing employees
                const employeeRef = doc(firestore, 'employees', employeeId);
                const updatedData: Partial<Employee> = {
                    name,
                    department,
                    ...(biometricTemplate !== undefined && { biometricTemplate }),
                };
                await updateDoc(employeeRef, updatedData);
                toast({
                    title: "Success",
                    description: `Employee updated successfully.`,
                });
                onSaveSuccess();
            }
        } catch (error) {
            console.error("[Inspect][StaffEditDialog] Error saving employee: ", error);
            const employeeRef = doc(firestore, 'employees', employeeId);
            // This error handling might need adjustment depending on where the error comes from (flow vs. update)
            const permissionError = new FirestorePermissionError({
                path: employeeRef.path,
                operation: isNewEmployee ? 'create' : 'update',
                requestResourceData: { name, department, employeeId },
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save employee data.' });
        }
    });
  };

  const hasBiometric = !!biometricTemplate;
  const dialogTitle = isNewEmployee ? 'Add New Staff' : 'Edit Staff';
  const dialogDescription = isNewEmployee
    ? "Fill in the details for the new employee."
    : "Update the details for this employee.";

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Employee Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="id">Employee Number</Label>
                <Input id="id" value={employeeId} onChange={(e) => setEmployeeId(e.target.value.toUpperCase())} disabled={!isNewEmployee} placeholder="e.g. E-011" />
            </div>
          </div>
           <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => ( <SelectItem key={dep} value={dep}>{dep}</SelectItem> ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Biometrics</Label>
            <div className="flex items-center gap-4">
               <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${hasBiometric ? 'bg-green-100' : 'bg-muted'}`}>
                    <Fingerprint className={`h-8 w-8 ${hasBiometric ? 'text-green-600' : 'text-muted-foreground'}`} />
                </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {hasBiometric ? "Biometric data is enrolled for this user." : "Capture the employee's fingerprint for authentication."}
                </p>
                <Button variant="outline" size="sm" onClick={handleBiometricScan} disabled={isScanning} className="mt-2">
                  {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : (hasBiometric ? "Rescan Fingerprint" : "Scan Fingerprint")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
