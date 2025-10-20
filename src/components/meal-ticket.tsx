'use client';

import { useState, useEffect } from 'react';
import type { TicketData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Utensils } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface MealTicketProps {
  ticket: (Omit<TicketData, 'timestamp'> & { timestamp: Date }) | null;
}

export default function MealTicket({ ticket }: MealTicketProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    if (ticket?.timestamp) {
      setFormattedDate(ticket.timestamp.toLocaleDateString());
      setFormattedTime(ticket.timestamp.toLocaleTimeString());
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <Card className="flex h-[300px] items-center justify-center border-dashed no-print">
        <div className="text-center text-muted-foreground">
          <Ticket className="mx-auto h-12 w-12" />
          <p className="mt-4">Authenticate an employee to generate a ticket.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white text-black font-mono w-full print:w-[70mm] p-2 print:p-0 mx-auto">
        <div className="text-center space-y-2">
            <Utensils className="h-8 w-8 mx-auto" />
            <h2 className="font-bold text-lg">Meal Ticket</h2>
            <p className="text-xs">Graphic Packaging International</p>
        </div>

        <div className="my-3 border-t-2 border-dashed border-black"></div>

        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="font-bold">Employee:</span>
                <span>{ticket.employeeName}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">Department:</span>
                <span>{ticket.department}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">Ticket ID:</span>
                <span>{ticket.ticketId}</span>
            </div>
             {formattedDate ? (
                <>
                    <div className="flex justify-between">
                        <span className="font-bold">Date:</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Time:</span>
                        <span>{formattedTime}</span>
                    </div>
                </>
             ) : (
                <div className="space-y-1">
                    <Skeleton className="h-4 w-full bg-gray-300" />
                    <Skeleton className="h-4 w-full bg-gray-300" />
                </div>
             )}
        </div>

        <div className="my-3 border-t-2 border-dashed border-black"></div>

        <p className="text-center text-xs">Valid for one meal. Not transferable.</p>
    </div>
  );
}
