
'use client';
import StaffList from '@/components/staff-list';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'ADMIN') {
    return <p>Redirecting...</p>;
  }

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
