'use client';

import type { Employee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface BiometricScannerProps {
  onScan: () => void;
  isScanning: boolean;
  isAuthenticated: boolean;
  scanError?: boolean;
  authenticatedEmployee: Employee | null;
}

export default function BiometricScanner({
  onScan,
  isScanning,
  isAuthenticated,
  scanError,
  authenticatedEmployee
}: BiometricScannerProps) {
  
  const getScanStateIcon = () => {
    if (isAuthenticated) {
      return <CheckCircle2 className="h-24 w-24 text-green-500 animate-in fade-in zoom-in-50" />;
    }
    if (scanError) {
      return <XCircle className="h-24 w-24 text-destructive animate-in fade-in zoom-in-50" />;
    }
    return (
      <>
        <Fingerprint 
          className={`h-24 w-24 text-primary transition-opacity duration-300 ${isScanning ? 'opacity-20' : 'opacity-100'}`} 
        />
        {isScanning && <div className="absolute inset-0 rounded-full fingerprint-glow" />}
      </>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Fingerprint /> Biometric Authentication
        </CardTitle>
        <CardDescription>Place your finger on the scanner to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-6">
        
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-muted/50">
          {getScanStateIcon()}
        </div>
        
        {authenticatedEmployee && isAuthenticated && (
            <div className="text-center animate-in fade-in-50">
                <p className="font-medium text-lg">{authenticatedEmployee.name}</p>
                <p className="text-sm text-muted-foreground">{authenticatedEmployee.id}</p>
            </div>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={onScan} disabled={isScanning || isAuthenticated} className="w-full">
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : isAuthenticated ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Authenticated
            </>
          ) : (
            'Scan Fingerprint'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
