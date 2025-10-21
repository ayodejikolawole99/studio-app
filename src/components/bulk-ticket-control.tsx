
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Minus, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulkTicketControlProps {
  departments: string[];
  onUpdate: (department: string, amount: number) => void;
  isUpdating: boolean;
}

export default function BulkTicketControl({ departments, onUpdate, isUpdating }: BulkTicketControlProps) {
    const [amount, setAmount] = useState<number>(20);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleConfirmation = () => {
        if (amount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Amount must be a positive number.' });
            return;
        }
        if (!selectedDepartment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a department.' });
            return;
        }
        setIsDialogOpen(false); // Close dialog immediately
        const updateAmount = operation === 'add' ? amount : -amount;
        onUpdate(selectedDepartment, updateAmount);
    };

    const openDialog = (op: 'add' | 'subtract') => {
        setOperation(op);
        setIsDialogOpen(true);
    };

    const departmentLabel = selectedDepartment === 'all' 
        ? 'all employees' 
        : `every employee in the ${departments.find(d => d === selectedDepartment)} department`;

    const dialogDescription = operation === 'add' 
        ? `Are you sure you want to add ${amount} tickets to ${departmentLabel}?`
        : `Are you sure you want to subtract ${amount} tickets from ${departmentLabel}? This action cannot be undone.`;

    const isDisabled = isUpdating || !selectedDepartment;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    Bulk Allocation
                </CardTitle>
                <CardDescription>Add or subtract tickets for a department or all employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="department-select">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={isUpdating}>
                            <SelectTrigger id="department-select">
                                <SelectValue placeholder="Select department..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dep => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bulk-ticket-amount">Number of Tickets</Label>
                        <Input 
                            id="bulk-ticket-amount" 
                            type="number" 
                            min="1" 
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            placeholder="e.g., 20"
                            disabled={isUpdating}
                        />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    This action will modify the balance of each employee in the selected group.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                 <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button className="w-full" disabled={isDisabled} onClick={() => openDialog('add')}>
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2"/>}
                            Allocate Tickets
                        </Button>
                         <Button variant="destructive" className="w-full" disabled={isDisabled} onClick={() => openDialog('subtract')}>
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Minus className="mr-2"/>}
                            Subtract Tickets
                        </Button>
                    </div>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogDescription}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmation} disabled={isUpdating}>
                            {isUpdating ? 'Processing...' : 'Confirm'}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
