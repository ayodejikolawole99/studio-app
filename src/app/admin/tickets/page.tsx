import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ticket Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Allocate individual and bulk tickets to employees.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ticket management UI will go here.</p>
          {/* TODO: Add components for adding single and bulk tickets */}
        </CardContent>
      </Card>
    </>
  )
}
