'use client';
import { createContext, ReactNode, useContext, useState, useMemo } from 'react';
import type { FeedingRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const firestore = useFirestore();

    const feedingRecordsRef = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'feedingRecords'), orderBy('timestamp', 'desc'), limit(100)) : null
    , [firestore]);
    
    const { data: feedingRecords, isLoading } = useCollection<FeedingRecord>(feedingRecordsRef);

    // This function is for testing/demo purposes.
    const addMockRecord = async () => {
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, 'feedingRecords'), {
                employeeId: `MOCK-${Math.floor(Math.random() * 100)}`,
                employeeName: "Mock User",
                department: "Testing",
                timestamp: serverTimestamp(),
            });
            toast({ title: 'Success', description: 'Mock feeding record added to Firestore.' });
        } catch (error) {
            console.error("Error adding mock record: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add mock record.' });
        }
    };
    
    const recordsWithDate = useMemo(() => {
        if (!feedingRecords) return [];
        return feedingRecords.map(r => ({
            ...r,
            // Convert Firestore Timestamp to JS Date object
            timestamp: (r.timestamp as any)?.toDate ? (r.timestamp as any).toDate() : new Date(),
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
