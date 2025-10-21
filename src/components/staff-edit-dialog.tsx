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
import { useEffect, useState } from 'react';
import type { Employee } from '@/lib/types';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const departments = ["Production", "Logistics", "Quality Assurance", "Human Resources", "Maintenance", "IT", "Finance"];

interface StaffEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  employee: Employee | null;
  onSave: (employee: Omit<Employee, 'id'> & { id: string }, isNew: boolean) => void;
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
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(employee?.name || '');
      setEmployeeId(employee?.id || '');
      setDepartment(employee?.department || '');
      setHasBiometric(employee?.hasBiometric || false);
    } else {
      // Reset form when dialog is closed
      setName('');
      setEmployeeId('');
      setDepartment('');
      setHasBiometric(false);
    }
  }, [isOpen, employee]);

  const handleBiometricScan = () => {
    setIsScanning(true);
    // TODO: Integrate with SecuGen WebAPI
    setTimeout(() => {
      setIsScanning(false);
      setHasBiometric(true);
      toast({
        title: "Biometric Scan Successful",
        description: "Fingerprint data has been captured (simulated).",
      });
    }, 1500);
  };

  const handleSave = () => {
    if (!name) {
      toast({ variant: "destructive", title: "Validation Error", description: "Employee name cannot be empty." });
      return;
    }
    if (!employeeId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Employee number cannot be empty." });
      return;
    }
    if (!department) {
      toast({ variant: "destructive", title: "Validation Error", description: "Department cannot be empty." });
      return;
    }

    const isNew = !employee;

    const employeeData: Omit<Employee, 'id'> & { id: string } = {
      id: employeeId, // Use the state for employeeId, which is the document ID
      name,
      department,
      ticketBalance: isNew ? 20 : (employee?.ticketBalance || 0), // Default to 20 tickets for new employees
      hasBiometric,
    };

    onSave(employeeData, isNew);
    setIsOpen(false);
  };

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
