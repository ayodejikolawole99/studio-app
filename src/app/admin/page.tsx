'use client';

import { useState, useTransition, useMemo } from 'react';
import type { FeedingRecord, AnalysisData } from '@/lib/types';
import { employees } from '@/lib/data';
import ConsumptionAnalysis from '@/components/consumption-analysis';
import { analyzeEmployeeConsumptionTrends } from '@/ai/flows/analyze-employee-consumption-trends';
import { useToast } from "@/hooks/use-toast"
import FeedingHistory from '@/components/feeding-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function AdminDashboardPage() {
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const { toast } = useToast();

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

  const ticketsThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return feedingRecords.filter(r => r.timestamp > oneWeekAgo).length;
  }, [feedingRecords]);

  const uniqueEmployeesToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const uniqueIds = new Set(feedingRecords.filter(r => r.timestamp > today).map(r => r.employeeId));
    return uniqueIds.size;
  }, [feedingRecords]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Analyze consumption patterns and view recent activity.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Tickets Printed (Today)" value={feedingRecords.length} icon={<Ticket className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Tickets Printed (This Week)" value={ticketsThisWeek} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Unique Employees (Today)" value={uniqueEmployeesToday} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
           <FeedingHistory records={feedingRecords} />
           <Button onClick={addMockRecord} className="w-full">Add Mock Printing Record</Button>
        </div>

        <div className="lg:col-span-3">
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
