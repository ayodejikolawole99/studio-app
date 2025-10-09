
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
import { Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  employee: Employee | null;
  onSave: (employee: Employee, isNew: boolean) => void;
}

export function StaffEditDialog({
  isOpen,
  setIsOpen,
  employee,
  onSave,
}: StaffEditDialogProps) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [department, setDepartment] = useState('');
  const [ticketBalance, setTicketBalance] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(employee?.name || '');
      setId(employee?.id || '');
      setDepartment(employee?.department || '');
      setTicketBalance(employee?.ticketBalance || 0);
    }
  }, [isOpen, employee]);

  const handleBiometricScan = () => {
    setIsScanning(true);
    // Simulate biometric scan
    // TODO: Integrate with SecuGen WebAPI
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Biometric Scan Successful",
        description: "Fingerprint data has been captured.",
      });
    }, 1500);
  };

  const handleSave = () => {
    if (!name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Employee name cannot be empty.",
      });
      return;
    }
    if (!employee && !id) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Employee number cannot be empty.",
        });
        return;
      }
    if (!department) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Department cannot be empty.",
        });
        return;
    }

    const employeeData: Employee = {
      id: id,
      name: name,
      department: department,
      ticketBalance: ticketBalance
    };

    onSave(employeeData, !employee);
    setIsOpen(false);
    toast({
      title: "Success",
      description: `Employee ${employee ? 'updated' : 'added'} successfully.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          <DialogDescription>
            {employee
              ? 'Update the details for this employee.'
              : 'Fill in the details for the new employee.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Employee Name</Label>
                <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="id">Employee Number</Label>
                <Input id="id" value={id} onChange={(e) => setId(e.target.value)} disabled={!!employee} placeholder="e.g. E-011" />
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Production"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketBalance">Ticket Balance</Label>
              <Input id="ticketBalance" type="number" value={ticketBalance} onChange={(e) => setTicketBalance(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Biometrics</Label>
            <div className="flex items-center gap-4">
               <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    <Fingerprint className="h-8 w-8 text-muted-foreground" />
                </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Capture the employee's fingerprint for authentication.
                </p>
                <Button variant="outline" size="sm" onClick={handleBiometricScan} disabled={isScanning} className="mt-2">
                  {isScanning ? "Scanning..." : "Scan Fingerprint"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
