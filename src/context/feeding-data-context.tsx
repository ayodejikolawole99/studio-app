
'use client';
import { createContext, ReactNode, useContext, useState, useMemo } from 'react';
import type { FeedingRecord } from '@/lib/types';
import { mockFeedingRecords } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    
    const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>(mockFeedingRecords);
    const [isLoading, setIsLoading] = useState(false);

    // This function is for testing/demo purposes.
    const addMockRecord = () => {
        const newRecord: FeedingRecord = {
            id: `MOCK-${Date.now()}`,
            employeeId: `E-MOCK-${Math.floor(Math.random() * 100)}`,
            employeeName: "Mock User",
            department: "Testing",
            timestamp: new Date(),
        };

        setFeedingRecords(prev => [newRecord, ...prev]);

        toast({ title: 'Success', description: 'Mock feeding record added locally.' });
    };
    
    const recordsWithDate = useMemo(() => {
        if (!feedingRecords) return [];
        return feedingRecords.map(r => ({
            ...r,
            timestamp: new Date(r.timestamp), // Ensure timestamp is a Date object
        }));
    }, [feedingRecords]);
    

    return (
        <FeedingDataContext.Provider value={{ feedingRecords: recordsWithDate, addMockRecord, isLoading }}>
            {children}
        </FeedingDataContext.Provider>
    );
};

export const useFeedingData = () => {
    const context = useContext(FeedingDataContext);
    if (context === undefined) {
        throw new Error('useFeedingData must be used within a FeedingDataProvider');
    }
    return context;
};
