
'use client';
import { createContext, ReactNode, useContext, useState } from 'react';
import type { FeedingRecord, Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';


interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const employeesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'employees');
    }, [firestore]);
    const { data: employees } = useCollection<Employee>(employeesCollection);

    const feedingRecordsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'feedingRecords');
    }, [firestore]);
    const { data: feedingRecords, isLoading } = useCollection<FeedingRecord>(feedingRecordsCollection);


    const addMockRecord = () => {
        if (!employees || employees.length === 0 || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add mock record, employee data not available.' });
            return;
        };

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord: Omit<FeedingRecord, 'id'> = {
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };

        const feedingRecordsColRef = collection(firestore, 'feedingRecords');
        addDocumentNonBlocking(feedingRecordsColRef, newRecord);

        toast({ title: 'Success', description: 'Mock feeding record added.'});
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
