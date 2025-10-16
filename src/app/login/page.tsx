'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function LoginPageContent() {
  const router = useRouter();

  return (
    <>
        <div 
            className="fixed inset-0 -z-10 bg-background/50"
        ></div>
        <div 
            className="fixed inset-0 -z-20 bg-contain bg-no-repeat bg-center opacity-10"
            style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg')"}}
        ></div>
        <main className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Graphic_Packaging_International_Logo.jpg" width={200} height={40} alt="Logo" className="mx-auto mb-4"/>
                    <CardTitle className="font-headline text-2xl">Admin Access</CardTitle>
                    <CardDescription>Authentication is currently disabled. You can access the admin panel directly.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push('/admin')} className="w-full">
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
