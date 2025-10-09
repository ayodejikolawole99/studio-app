import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Reports
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View individual and group-based consumption reports.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Reporting Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Reporting UI will go here.</p>
          {/* TODO: Add components for individual and group reports */}
        </CardContent>
      </Card>
    </>
  )
}
