'use client';

import { useState } from 'react';
import type { Employee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Plus, Minus } from 'lucide-react';

interface IndividualTicketControlProps {
    employees: Employee[];
    onUpdate: (employeeId: string, amount: number) => void;
}

export default function IndividualTicketControl({ employees, onUpdate }: IndividualTicketControlProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [amount, setAmount] = useState<number>(1);
    const { toast } = useToast();

    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployeeId);

    const handleUpdate = (operation: 'add' | 'subtract') => {
        if (!selectedEmployeeId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select an employee.' });
            return;
        }
        if (amount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Amount must be a positive number.' });
            return;
        }

        const updateAmount = operation === 'add' ? amount : -amount;
        onUpdate(selectedEmployeeId, updateAmount);

        // Reset amount after update
        setAmount(1);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <User />
                    Individual Allocation
                </CardTitle>
                <CardDescription>Add or remove tickets for a single employee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="employee-select">Employee</Label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger id="employee-select">
                           <SelectValue placeholder="Select an employee...">
                                {selectedEmployeeData ? (
                                    <div className="flex justify-between w-full">
                                        <span>{selectedEmployeeData.name}</span>
                                        <span className="text-muted-foreground mr-2">{`Bal: ${selectedEmployeeData.ticketBalance}`}</span>
                                    </div>
                                ) : "Select an employee..."}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    <div className="flex justify-between w-full">
                                        <span>{emp.name}</span>
                                        <span className="text-muted-foreground mr-2">{`Bal: ${emp.ticketBalance}`}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ticket-amount">Number of Tickets</Label>
                    <Input 
                        id="ticket-amount" 
                        type="number" 
                        min="1" 
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        placeholder="e.g., 5"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button onClick={() => handleUpdate('add')} className="w-full" disabled={!selectedEmployeeId}>
                    <Plus className="mr-2"/>
                    Add Tickets
                </Button>
                <Button onClick={() => handleUpdate('subtract')} variant="destructive" className="w-full" disabled={!selectedEmployeeId}>
                    <Minus className="mr-2"/>
                    Subtract Tickets
                </Button>
            </CardFooter>
        </Card>
    );
}
