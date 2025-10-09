'use client';

import { useState, useTransition } from 'react';
import type { Employee, FeedingRecord, AnalysisData } from '@/lib/types';
import { employees } from '@/lib/data';
import FeedingHistory from '@/components/feeding-history';
import ConsumptionAnalysis from '@/components/consumption-analysis';
import { analyzeEmployeeConsumptionTrends } from '@/ai/flows/analyze-employee-consumption-trends';
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const { toast } = useToast();

  // This is a mock function. In a real app, you'd get this from page.tsx scan.
  const addMockRecord = () => {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const newRecord: FeedingRecord = {
        id: `FR-${Date.now()}`,
        employeeId: randomEmployee.id,
        employeeName: randomEmployee.name,
        timestamp: new Date(),
      };
    setFeedingRecords(prev => [newRecord, ...prev]);
  }

  const handleAnalysis = () => {
    if(feedingRecords.length === 0){
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Not enough data to perform analysis. Please record some feedings first.",
      });
      return;
    }
    startAnalysisTransition(async () => {
      try {
        const result = await analyzeEmployeeConsumptionTrends({
          feedingData: JSON.stringify(feedingRecords.map(r => ({
            employeeId: r.employeeId,
            timestamp: r.timestamp.toISOString(),
          }))),
        });
        setAnalysis(result);
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "AI Analysis Failed",
          description: "Could not generate consumption analysis. Please try again later.",
        });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage employee feeding and analyze consumption patterns.
        </p>
      </header>
      
      {/* TODO: Add components for user management (add/edit/delete), ticket management etc. */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
        <div className="md:col-span-2">
           <FeedingHistory records={feedingRecords} />
           <button onClick={addMockRecord} className="mt-4 p-2 w-full bg-blue-500 text-white rounded">Add Mock Record</button>
        </div>

        <div className="md:col-span-3">
            <ConsumptionAnalysis
                onAnalyze={handleAnalysis}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
              />
        </div>
      </div>
    </div>
  );
}
