
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  onUpdate: (amount: number) => void;
}

export default function BulkTicketControl({ onUpdate }: BulkTicketControlProps) {
    const [amount, setAmount] = useState<number>(20);
    const { toast } = useToast();

    const handleBulkAdd = () => {
        if (amount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Amount must be a positive number.' });
            return;
        }
        onUpdate(amount);
        toast({
            title: 'Success',
            description: `${amount} tickets have been added to all employees.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    Bulk Allocation
                </CardTitle>
                <CardDescription>Add monthly or bulk tickets to all employees at once.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="bulk-ticket-amount">Number of Tickets to Add</Label>
                    <Input 
                        id="bulk-ticket-amount" 
                        type="number" 
                        min="1" 
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        placeholder="e.g., 20"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    This action will add the specified number of tickets to every employee's current balance.
                </p>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full">
                            <Plus className="mr-2"/>
                            Add to All Employees
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Allocation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to add {amount} tickets to every employee? This action cannot be undone.
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
