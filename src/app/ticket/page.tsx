'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MealTicket from '@/components/meal-ticket';
import { Button } from '@/components/ui/button';
import type { TicketData } from '@/lib/types';
import { Home } from 'lucide-react';

function TicketPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketJSON = searchParams.get('ticket');
  
  let ticket: TicketData | null = null;
  if (ticketJSON) {
    const parsed = JSON.parse(ticketJSON);
    ticket = {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 bg-background/50"
      ></div>
      <div 
        className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10"
        style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
      ></div>
      <main 
        className="min-h-screen flex items-center justify-center bg-transparent p-4"
      >
        <div className="w-full max-w-md space-y-6">
          <header className="text-center bg-background/80 backdrop-blur-sm p-4 rounded-xl">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Your Meal Ticket
              </h1>
              <p className="mt-1 text-muted-foreground">
                Present this ticket at the canteen.
              </p>
          </header>
          <MealTicket ticket={ticket} />
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            <Home className="mr-2"/>
            Back to Authentication
          </Button>
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
