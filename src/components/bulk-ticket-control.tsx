
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Users, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BulkTicketControlProps {
  departments: string[];
  onUpdate: (department: string, amount: number) => void;
}

export default function BulkTicketControl({ departments, onUpdate }: BulkTicketControlProps) {
    const [amount, setAmount] = useState<number>(20);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const { toast } = useToast();

    const handleBulkAdd = () => {
        if (amount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Amount must be a positive number.' });
            return;
        }
        if (!selectedDepartment) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a department.' });
            return;
        }
        onUpdate(selectedDepartment, amount);
        toast({
            title: 'Success',
            description: `${amount} tickets added to ${selectedDepartment === 'all' ? 'all employees' : `the ${selectedDepartment} department`}.`,
        });
    };

    const departmentLabel = selectedDepartment === 'all' 
        ? 'all employees' 
        : `every employee in the ${departments.find(d => d === selectedDepartment)} department`;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    Bulk Allocation
                </CardTitle>
                <CardDescription>Add monthly or bulk tickets to a department or all employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="department-select">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
                        <Label htmlFor="bulk-ticket-amount">Tickets to Add</Label>
                        <Input 
                            id="bulk-ticket-amount" 
                            type="number" 
                            min="1" 
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            placeholder="e.g., 20"
                        />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    This action will add the specified number of tickets to the balance of each employee in the selected group.
                </p>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={!selectedDepartment}>
                            <Plus className="mr-2"/>
                            Allocate Tickets
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Allocation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to add {amount} tickets to {departmentLabel}? This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkAdd}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
