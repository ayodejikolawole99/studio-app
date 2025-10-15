'use client';
import { createContext, ReactNode, useMemo } from 'react';
import type { FeedingRecord } from '@/lib/types';
import { useCollection, useFirebase, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
    isLoading: boolean;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const { firestore } = useFirebase();

    const feedingRecordsCollection = useMemoFirebase(() =>
        firestore ? collection(firestore, 'feedingRecords') : null
    , [firestore]);

    const { data: feedingRecords, isLoading } = useCollection<FeedingRecord>(feedingRecordsCollection);

    const employeesCollection = useMemoFirebase(() =>
        firestore ? collection(firestore, 'employees') : null
    , [firestore]);

    const { data: employees } = useCollection(employeesCollection);

    const addMockRecord = () => {
        if (!firestore || !employees || employees.length === 0) return;

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord = {
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };
        
        const feedingRecordsRef = collection(firestore, 'feedingRecords');
        addDocumentNonBlocking(feedingRecordsRef, newRecord);
    };

    return (
        <FeedingDataContext.Provider value={{ feedingRecords: feedingRecords || [], addMockRecord, isLoading }}>
            {children}
        </FeedingDataContext.Provider>
    );
};
