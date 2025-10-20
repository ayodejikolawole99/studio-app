'use client';

import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

function LoginPageContent() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // If user is already authenticated, redirect them to the admin dashboard.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Authenticating & Redirecting...</p>
        </div>
    );
  }

  // This content is shown if there's no user and loading is complete.
  // In our setup with anonymous auth, this page will likely just be a flash before redirecting.
  return (
    <>
        <div className="fixed inset-0 -z-10 bg-background/50"></div>
        <div 
            className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10"
            style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
        ></div>
        <main className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg" width={200} height={40} alt="Logo" className="mx-auto mb-4"/>
                    <CardTitle className="font-headline text-2xl">Admin Access</CardTitle>
                    <CardDescription>Authentication is handled automatically. You will be redirected shortly.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push('/admin')} className="w-full" disabled>
                        Go to Admin Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </main>
    </>
  );
}

export default function LoginPage() {
    return <LoginPageContent />;
}
