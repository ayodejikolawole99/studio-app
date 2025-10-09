import StaffList from '@/components/staff-list';

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
      <StaffList />
    </>
  )
}
