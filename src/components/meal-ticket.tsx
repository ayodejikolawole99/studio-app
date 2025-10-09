'use client';

import { useState, useEffect } from 'react';
import type { TicketData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface MealTicketProps {
  ticket: TicketData | null;
}

export default function MealTicket({ ticket }: MealTicketProps) {
  const [formattedTimestamp, setFormattedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (ticket?.timestamp) {
      setFormattedTimestamp(ticket.timestamp.toLocaleString());
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <Card className="flex h-[300px] items-center justify-center border-dashed print:hidden">
        <div className="text-center text-muted-foreground">
          <Ticket className="mx-auto h-12 w-12" />
          <p className="mt-4">Authenticate an employee to generate a ticket.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden shadow-lg animate-in fade-in zoom-in-95 print:shadow-none print:border print:rounded-lg">
      <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-background print:hidden"></div>
      <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-background print:hidden"></div>
      <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-background print:hidden"></div>
      <div className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-background print:hidden"></div>

      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="font-headline text-2xl font-bold text-primary">Meal Ticket</h2>
                <p className="text-sm text-muted-foreground">Valid for one meal</p>
            </div>
            <Ticket className="h-10 w-10 text-primary/70" />
        </div>

        <div className="my-6 border-t-2 border-dashed border-border"></div>

        <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="text-xl font-semibold">{ticket.employeeName}</p>
        </div>

        <div className="my-6 border-t-2 border-dashed border-border"></div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Ticket ID</p>
                <p className="font-mono font-medium">{ticket.ticketId}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Date & Time</p>
                {formattedTimestamp ? (
                  <p className="font-medium">{formattedTimestamp}</p>
                ) : (
                  <Skeleton className="h-5 w-[150px] ml-auto" />
                )}
            </div>
        </div>
      </div>
    </Card>
  );
}
