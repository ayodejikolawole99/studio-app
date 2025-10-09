'use client';

import type { Employee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fingerprint, Loader2, CheckCircle2, XCircle, User } from 'lucide-react';

interface BiometricScannerProps {
  employees: Employee[];
  selectedEmployee: Employee | undefined;
  onSelectEmployee: (id: string) => void;
  onScan: () => void;
  isScanning: boolean;
  isAuthenticated: boolean;
  scanError?: boolean;
}

export default function BiometricScanner({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onScan,
  isScanning,
  isAuthenticated,
  scanError,
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
        <div className="absolute inset-0 rounded-full fingerprint-glow" />
      </>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Fingerprint /> Biometric Authentication
        </CardTitle>
        <CardDescription>Select your name and scan your fingerprint to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-xs">
          <Select value={selectedEmployee?.id} onValueChange={onSelectEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person portrait" />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span>{employee.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-muted/50">
          {getScanStateIcon()}
        </div>
        
        {selectedEmployee && !isAuthenticated && !scanError && (
            <div className="text-center">
                <p className="font-medium text-lg">{selectedEmployee.name}</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.id}</p>
            </div>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={onScan} disabled={isScanning || !selectedEmployee || isAuthenticated} className="w-full">
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
