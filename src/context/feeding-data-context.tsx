'use client';
import { createContext, ReactNode, useContext } from 'react';
import type { FeedingRecord, Employee } from '@/lib/types';
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();

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
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add mock record, employee data not loaded.' });
            return;
        };

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord = {
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        const feedingRecordsRef = collection(firestore, 'feedingRecords');
        addDocumentNonBlocking(feedingRecordsRef, newRecord);

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
