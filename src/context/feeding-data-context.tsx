'use client';
import { createContext, useState, ReactNode } from 'react';
import type { FeedingRecord } from '@/lib/types';
import { employees } from '@/lib/data';

interface FeedingDataContextType {
    feedingRecords: FeedingRecord[];
    addMockRecord: () => void;
}

export const FeedingDataContext = createContext<FeedingDataContextType | undefined>(undefined);

export const FeedingDataProvider = ({ children }: { children: ReactNode }) => {
    const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);

    const addMockRecord = () => {
        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        const newRecord: FeedingRecord = {
            id: `FR-${Date.now()}`,
            employeeId: randomEmployee.id,
            employeeName: randomEmployee.name,
            department: randomEmployee.department,
            timestamp: new Date(),
        };
        setFeedingRecords(prev => [newRecord, ...prev]);
    };

    return (
        <FeedingDataContext.Provider value={{ feedingRecords, addMockRecord }}>
            {children}
        </FeedingDataContext.Provider>
    );
};
