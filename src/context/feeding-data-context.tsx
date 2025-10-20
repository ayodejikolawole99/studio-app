'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import type { FeedingRecord } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const firestore = useFirestore();

    const feedingRecordsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'feedingRecords'), orderBy('timestamp', 'desc'), limit(100));
    }, [firestore]);

    const { data: feedingRecords, isLoading } = useCollection<FeedingRecord>(feedingRecordsRef);

    // This function is now for testing/demo purposes.
    const addMockRecord = () => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
            return;
        }

        const mockData = {
            employeeId: `E-MOCK-${Math.floor(Math.random() * 100)}`,
            employeeName: "Mock User",
            department: "Testing",
            timestamp: serverTimestamp(),
        };

        const recordsColRef = collection(firestore, 'feedingRecords');
        addDocumentNonBlocking(recordsColRef, mockData);

        toast({ title: 'Success', description: 'Mock feeding record added to Firestore.' });
    };

    const recordsWithDate = useMemo(() => {
        if (!feedingRecords) return [];
        return feedingRecords.map(r => ({
            ...r,
            timestamp: (r.timestamp as Timestamp).toDate(),
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
