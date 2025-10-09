import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Staff Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add, edit, and manage employee information.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Staff Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Staff management UI will go here.</p>
          {/* TODO: Add components for adding, editing, and deleting staff */}
        </CardContent>
      </Card>
    </>
  )
}
