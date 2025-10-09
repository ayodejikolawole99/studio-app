'use client';

import { useState, useTransition } from 'react';
import type { FeedingRecord, AnalysisData } from '@/lib/types';
import { employees } from '@/lib/data';
import ConsumptionAnalysis from '@/components/consumption-analysis';
import { analyzeEmployeeConsumptionTrends } from '@/ai/flows/analyze-employee-consumption-trends';
import { useToast } from "@/hooks/use-toast"
import FeedingHistory from '@/components/feeding-history';

export default function AdminDashboardPage() {
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
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Analyze consumption patterns and view recent activity.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
           <FeedingHistory records={feedingRecords} />
           <button onClick={addMockRecord} className="mt-4 p-2 w-full bg-blue-500 text-white rounded">Add Mock Record</button>
        </div>

        <div className="lg:col-span-3">
            <ConsumptionAnalysis
                onAnalyze={handleAnalysis}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
              />
        </div>
      </div>
    </>
  );
}
