'use client';
import { createContext, ReactNode, useContext, useState } from 'react';
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
    const [isLoading, setIsLoading] = useState(false);

    const addMockRecord = () => {
        if (!mockEmployees || mockEmployees.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add mock record, employee data not loaded.' });
            return;
        };

        const randomEmployee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
        const newRecord: FeedingRecord = {
            id: `rec-${Date.now()}`,
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        setFeedingRecords(prev => [newRecord, ...prev]);

        toast({ title: 'Success', description: 'Mock feeding record added locally.'});
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
