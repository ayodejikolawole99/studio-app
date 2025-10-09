'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Employee, FeedingRecord, TicketData, AnalysisData } from '@/lib/types';
import { employees } from '@/lib/data';
import BiometricScanner from '@/components/biometric-scanner';
import FeedingHistory from '@/components/feeding-history';
import MealTicket from '@/components/meal-ticket';
import ConsumptionAnalysis from '@/components/consumption-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, BarChart } from 'lucide-react';
import { analyzeEmployeeConsumptionTrends } from '@/ai/flows/analyze-employee-consumption-trends';
import { useToast } from "@/hooks/use-toast"

export default function CanteenTrackerDashboard() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0].id);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [latestTicket, setLatestTicket] = useState<TicketData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnalyzing, startAnalysisTransition] = useTransition();
  const { toast } = useToast();

  const handleScan = () => {
    if (!selectedEmployeeId) return;
    
    setIsScanning(true);
    setIsAuthenticated(false);

    setTimeout(() => {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      if (!employee) {
        setIsScanning(false);
        return;
      }
      
      const newRecord: FeedingRecord = {
        id: `FR-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        timestamp: new Date(),
      };

      const newTicket: TicketData = {
        ticketId: `T-${Date.now()}`,
        employeeName: employee.name,
        employeeAvatarUrl: employee.avatarUrl,
        timestamp: newRecord.timestamp,
      };

      setFeedingRecords(prev => [newRecord, ...prev]);
      setLatestTicket(newTicket);
      
      setIsScanning(false);
      setIsAuthenticated(true);
      
      setTimeout(() => setIsAuthenticated(false), 2000);

    }, 1500);
  };

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
            foodItem: 'N/A',
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

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Canteen Tracker
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Biometric feeding management and consumption analysis.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          <BiometricScanner
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployeeId}
            onScan={handleScan}
            isScanning={isScanning}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <div className="md:col-span-3">
          <FeedingHistory records={feedingRecords} />
        </div>

        <div className="md:col-span-5">
          <Tabs defaultValue="ticket" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ticket">
                <Ticket className="mr-2 h-4 w-4" />
                Latest Ticket
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <BarChart className="mr-2 h-4 w-4" />
                Consumption Analysis
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ticket">
              <MealTicket ticket={latestTicket} />
            </TabsContent>
            <TabsContent value="analysis">
              <ConsumptionAnalysis
                onAnalyze={handleAnalysis}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
