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
import { doc, setDoc } from 'firebase/firestore';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

const departments = ["Production", "Logistics", "Quality Assurance", "Human Resources", "Maintenance", "IT", "Finance"];

interface StaffEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  employee: Employee | null;
  onSave: (employeeData: Partial<Employee>, isNew: boolean) => void;
}

export function StaffEditDialog({
  isOpen,
  setIsOpen,
  employee,
  onSave,
}: StaffEditDialogProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [biometricTemplate, setBiometricTemplate] = useState<string | undefined>(undefined);
  const [isScanning, startBiometricScan] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(employee?.name || '');
      setEmployeeId(employee?.id || '');
      setDepartment(employee?.department || '');
      setBiometricTemplate(employee?.biometricTemplate);
    } else {
      // Reset form when dialog is closed
      setName('');
      setEmployeeId('');
      setDepartment('');
      setBiometricTemplate(undefined);
    }
  }, [isOpen, employee]);

  const handleBiometricScan = () => {
    startBiometricScan(async () => {
      // In a real app, this would call the SecuGen WebAPI.
      // For now, we simulate the scan and get a template.
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
    if (!name || !employeeId || !department) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all fields." });
      return;
    }

    const isNew = !employee;
    
    // We only create partial data here. The onSave function will handle the merge.
    const employeeData: Partial<Employee> & { id: string } = {
      id: employeeId,
      name,
      department,
      // Only include the template if it has been scanned/exists
      ...(biometricTemplate && { biometricTemplate }),
    };

    onSave(employeeData, isNew);
    setIsOpen(false);
  };

  const hasBiometric = !!biometricTemplate;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Update the details for this employee.' : 'Fill in the details for the new employee.'}
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
                <Input id="id" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={!!employee} placeholder="e.g. E-011" />
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
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
