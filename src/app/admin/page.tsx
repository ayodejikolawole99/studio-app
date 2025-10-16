'use client';

import { useState, useTransition, useMemo } from 'react';
import type { AnalysisData } from '@/lib/types';
import ConsumptionAnalysis from '@/components/consumption-analysis';
import { analyzeEmployeeConsumptionTrends } from '@/ai/flows/analyze-employee-consumption-trends';
import { useToast } from "@/hooks/use-toast"
import FeedingHistory from '@/components/feeding-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedingDataProvider, useFeedingData } from '@/context/feeding-data-context';

const StatCard = ({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading?: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? <div className="h-8 w-1/2 bg-muted animate-pulse rounded" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

function DashboardContent() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const { toast } = useToast();
  const { feedingRecords, addMockRecord, isLoading } = useFeedingData();

  const handleAnalysis = () => {
    if(!feedingRecords || feedingRecords.length === 0){
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
            timestamp: r.timestamp,
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

  const sortedRecords = useMemo(() => {
    if (!feedingRecords) return [];
    const recordsWithDates = feedingRecords.map(r => ({...r, timestamp: (r.timestamp as any).toDate ? (r.timestamp as any).toDate() : new Date(r.timestamp) }));
    return recordsWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [feedingRecords]);
  
  const ticketsToday = useMemo(() => {
    if (!sortedRecords) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedRecords.filter(r => r.timestamp >= today).length;
  }, [sortedRecords]);

  const ticketsThisWeek = useMemo(() => {
    if (!sortedRecords) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return sortedRecords.filter(r => r.timestamp >= oneWeekAgo).length;
  }, [sortedRecords]);

  const uniqueEmployeesToday = useMemo(() => {
    if (!sortedRecords) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const uniqueIds = new Set(sortedRecords.filter(r => r.timestamp >= today).map(r => r.employeeId));
    return uniqueIds.size;
  }, [sortedRecords]);

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
        <StatCard title="Tickets Printed (Today)" value={ticketsToday} icon={<Ticket className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Tickets Printed (This Week)" value={ticketsThisWeek} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Unique Employees (Today)" value={uniqueEmployeesToday} icon={<Users className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
           <FeedingHistory records={sortedRecords.slice(0,10) || []} />
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


export default function AdminDashboardPage() {
  return (
    <FeedingDataProvider>
      <DashboardContent />
    </FeedingDataProvider>
  )
}
