'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MealTicket from '@/components/meal-ticket';
import { Button } from '@/components/ui/button';
import type { TicketData } from '@/lib/types';
import { Home, Printer } from 'lucide-react';

function TicketPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketJSON = searchParams.get('ticket');
  
  let ticket: (Omit<TicketData, 'timestamp'> & { timestamp: Date }) | null = null;
  if (ticketJSON) {
    const parsed = JSON.parse(ticketJSON);
    ticket = {
      ...parsed,
      timestamp: new Date(parsed.timestamp), // Ensure timestamp is a Date object
    };
  }

  const handlePrint = () => {
    window.print();
  }

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 bg-background/50 no-print"
      ></div>
      <div 
        className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10 no-print"
        style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
      ></div>
      <main 
        className="min-h-screen flex items-center justify-center bg-transparent p-4 print:bg-white print:min-h-0 print:p-0 print-container"
      >
        <div className="w-full max-w-md space-y-6 print:space-y-0 print:max-w-none print-content">
          <header className="text-center bg-background/80 backdrop-blur-sm p-4 rounded-xl no-print">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Your Meal Ticket
              </h1>
              <p className="mt-1 text-muted-foreground">
                Present this ticket at the canteen.
              </p>
          </header>
          <div className="print:p-0">
            <MealTicket ticket={ticket} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 no-print">
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              <Home className="mr-2"/>
              Back to Authentication
            </Button>
            <Button onClick={handlePrint} className="w-full">
              <Printer className="mr-2"/>
              Print Ticket
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function TicketPage() {
    return (
        <Suspense fallback={<div>Loading ticket...</div>}>
            <TicketPageContent />
        </Suspense>
    )
}
