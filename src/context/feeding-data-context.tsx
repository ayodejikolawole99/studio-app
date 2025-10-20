
'use client';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import type { FeedingRecord, Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { employees as mockEmployees } from '@/lib/data';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
    const [employees] = useState<Employee[]>(mockEmployees);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching feeding records
        setIsLoading(true);
        setTimeout(() => {
            setFeedingRecords([
              { id: 'FR-001', employeeId: 'E-001', employeeName: 'Alice Johnson', department: 'Production', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
              { id: 'FR-002', employeeId: 'E-003', employeeName: 'Charlie Brown', department: 'Production', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
            ]);
            setIsLoading(false);
        }, 500);
    }, []);


    const addMockRecord = () => {
        if (!employees || employees.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add mock record, employee data not available.' });
            return;
        };

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord: FeedingRecord = {
            id: `FR-${Date.now()}`,
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        setFeedingRecords(prev => [newRecord, ...prev]);

        toast({ title: 'Success (Local)', description: 'Mock feeding record added. (This is not saved).' });
    };

    return (
        <FeedingDataContext.Provider value={{ feedingRecords, addMockRecord, isLoading }}>
            {children}
        </FeedingDataContext.Provider>
    );
};

// Custom hook to use the FeedingDataContext
export const useFeedingData = () => {
    const context = useContext(FeedingDataContext);
    if (context === undefined) {
        throw new Error('useFeedingData must be used within a FeedingDataProvider');
    }
    return context;
};
