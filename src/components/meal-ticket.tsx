'use client';

import type { TicketData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Ticket, User } from 'lucide-react';

interface MealTicketProps {
  ticket: TicketData | null;
}

export default function MealTicket({ ticket }: MealTicketProps) {
  if (!ticket) {
    return (
      <Card className="flex h-[300px] items-center justify-center border-dashed">
        <div className="text-center text-muted-foreground">
          <Ticket className="mx-auto h-12 w-12" />
          <p className="mt-4">Authenticate an employee to generate a ticket.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden shadow-lg animate-in fade-in zoom-in-95">
      <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-background"></div>
      <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-background"></div>
      <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-background"></div>
      <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-background"></div>

      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="font-headline text-2xl font-bold text-primary">Meal Ticket</h2>
                <p className="text-sm text-muted-foreground">Valid for one meal</p>
            </div>
            <Ticket className="h-10 w-10 text-primary/70" />
        </div>

        <div className="my-6 border-t-2 border-dashed border-border"></div>

        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/50">
                <AvatarImage src={ticket.employeeAvatarUrl} alt={ticket.employeeName} />
                <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm text-muted-foreground">Employee</p>
                <p className="text-xl font-semibold">{ticket.employeeName}</p>
            </div>
        </div>

        <div className="my-6 border-t-2 border-dashed border-border"></div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Ticket ID</p>
                <p className="font-mono font-medium">{ticket.ticketId}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Date & Time</p>
                <p className="font-medium">{ticket.timestamp.toLocaleString()}</p>
            </div>
        </div>
      </div>
    </Card>
  );
}
