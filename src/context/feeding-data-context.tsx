'use client';
import { createContext, ReactNode, useContext } from 'react';
import type { FeedingRecord, Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const { firestore } = useFirebase();

    // Note: This assumes a root-level 'feedingRecords' collection.
    // If it's a subcollection, this query needs the full path.
    // Given the current usage, this seems fine for the dashboard's "Recent Prints".
    const feedingRecordsCollection = useMemoFirebase(() => 
        firestore ? collection(firestore, 'feedingRecords') : null
    , [firestore]);
    
    const { data: feedingRecords, isLoading } = useCollection<FeedingRecord>(feedingRecordsCollection);

    const employeesCollection = useMemoFirebase(() =>
        firestore ? collection(firestore, 'employees') : null
    , [firestore]);

    const { data: employees } = useCollection<Employee>(employeesCollection);

    const addMockRecord = () => {
        if (!firestore || !employees || employees.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add mock record, data not loaded.' });
            return;
        };

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord = {
            id: `rec-${Date.now()}`,
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        // Add to a root-level collection for the dashboard feed
        const recordsRef = collection(firestore, 'feedingRecords');
        addDocumentNonBlocking(recordsRef, newRecord);

        toast({ title: 'Success', description: 'Mock feeding record added to Firestore.'});
    };

    return (
        <FeedingDataContext.Provider value={{ feedingRecords: feedingRecords || [], addMockRecord, isLoading }}>
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
