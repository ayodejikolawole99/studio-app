'use client';

import type { AnalysisData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Clock, Utensils, FileText, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ConsumptionAnalysisProps {
  onAnalyze: () => void;
  analysis: AnalysisData | null;
  isAnalyzing: boolean;
}

const AnalysisCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string | React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-lg font-semibold">{content}</div>
    </CardContent>
  </Card>
);

const AnalysisSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-full" /></CardContent></Card>
        <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-full" /></CardContent></Card>
        <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-full" /></CardContent></Card>
        <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
    </div>
);


export default function ConsumptionAnalysis({ onAnalyze, analysis, isAnalyzing }: ConsumptionAnalysisProps) {
  return (
    <Card className="min-h-[300px]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Consumption Analysis</CardTitle>
            <p className="text-muted-foreground mt-1">AI-powered insights into employee feeding patterns.</p>
          </div>
          <Button onClick={onAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <AnalysisSkeleton />
        ) : analysis ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnalysisCard icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} title="Key Trends" content={analysis.trends} />
              <AnalysisCard icon={<Clock className="h-4 w-4 text-muted-foreground" />} title="Peak Hours" content={analysis.peakHours} />
              <AnalysisCard icon={<Utensils className="h-4 w-4 text-muted-foreground" />} title="Popular Food Items" content={analysis.popularFoodItems} />
            </div>
             <Card className="bg-accent/50 border-accent">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="p-2 bg-primary/10 rounded-full"><Lightbulb className="h-6 w-6 text-primary"/></div>
                    <div>
                        <CardTitle className="font-headline text-lg">Overall Analysis & Suggestions</CardTitle>
                        <p className="text-sm text-foreground/80 mt-2">{analysis.overallAnalysis}</p>
                    </div>
                </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
            <FileText className="h-12 w-12" />
            <p className="mt-4 max-w-xs">
              Click 'Generate Report' to analyze feeding history and get AI-driven insights on consumption trends, peak hours, and more.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
