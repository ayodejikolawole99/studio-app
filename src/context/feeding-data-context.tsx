'use client';
import { createContext, ReactNode, useContext, useState } from 'react';
import type { FeedingRecord, Employee } from '@/lib/types';
import { employees as mockEmployees } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
    const [employees] = useState<Employee[]>(mockEmployees);
    const { toast } = useToast();

    const addMockRecord = () => {
        if (!employees || employees.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No mock employee data available.'});
            return;
        };

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord: FeedingRecord = {
            id: `rec-${Date.now()}`,
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        setFeedingRecords(prev => [newRecord, ...prev]);
        toast({ title: 'Success', description: 'Mock feeding record added.'});
    };

    return (
        <FeedingDataContext.Provider value={{ feedingRecords: feedingRecords, addMockRecord, isLoading: false }}>
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
