'use client';
import { useState, useMemo, useContext } from 'react';
import { FeedingDataContext } from '@/context/feeding-data-context';
import type { FeedingRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { subDays, subWeeks, subMonths, startOfDay, format } from 'date-fns';
import { Ticket, Users, BarChart3, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type TimeFrame = 'day' | 'week' | 'month' | 'all';
type ReportType = 'user' | 'department';

const filterRecordsByTimeFrame = (records: FeedingRecord[], timeFrame: TimeFrame): FeedingRecord[] => {
    const now = new Date();
    switch (timeFrame) {
        case 'day':
            return records.filter(r => r.timestamp >= startOfDay(now));
        case 'week':
            return records.filter(r => r.timestamp >= subWeeks(now, 1));
        case 'month':
            return records.filter(r => r.timestamp >= subMonths(now, 1));
        case 'all':
        default:
            return records;
    }
};

const aggregateByUser = (records: FeedingRecord[]) => {
    const userCounts = records.reduce((acc, record) => {
        acc[record.employeeName] = (acc[record.employeeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
};

const aggregateByDepartment = (records: FeedingRecord[]) => {
    const departmentCounts = records.reduce((acc, record) => {
        const department = record.department || 'Unknown';
        acc[department] = (acc[department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(departmentCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
};


const ReportTable = ({ title, data, headers }: { title: string, data: { name: string, count: number }[], headers: [string, string] }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{headers[0]}</TableHead>
                        <TableHead className="text-right">{headers[1]}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(item => (
                        <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                No data for this period.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

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


export default function ReportsPage() {
  const context = useContext(FeedingDataContext);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [activeTab, setActiveTab] = useState<ReportType>('user');

  if (!context) {
    return <p>Loading reports...</p>;
  }

  const { feedingRecords } = context;

  const filteredData = useMemo(() => filterRecordsByTimeFrame(feedingRecords, timeFrame), [feedingRecords, timeFrame]);
  const userReportData = useMemo(() => aggregateByUser(filteredData), [filteredData]);
  const departmentReportData = useMemo(() => aggregateByDepartment(filteredData), [filteredData]);
  
  const totalTickets = filteredData.length;
  const uniqueUsers = new Set(filteredData.map(r => r.employeeId)).size;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const data = activeTab === 'user' ? userReportData : departmentReportData;
    const headers = activeTab === 'user' ? ["Employee", "Tickets Printed"] : ["Department", "Tickets Printed"];
    const title = `Report: Prints per ${activeTab} (${timeFrame})`;
    
    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [headers],
      body: data.map(item => [item.name, item.count]),
      startY: 20,
    });
    
    doc.save(`report_${activeTab}_${timeFrame}.pdf`);
  };

  const handleExportExcel = () => {
    const data = activeTab === 'user' ? userReportData : departmentReportData;
    const headers = activeTab === 'user' ? ["Employee", "Tickets Printed"] : ["Department", "Tickets Printed"];

    const worksheetData = [
      headers,
      ...data.map(item => [item.name, item.count])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `report_${activeTab}_${timeFrame}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Reports
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Analyze printing trends by user and department.
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as TimeFrame)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select a timeframe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Excel
              </Button>
            </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Tickets Printed" value={totalTickets} icon={<Ticket className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Unique Employees" value={uniqueUsers} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Average per User" value={uniqueUsers > 0 ? (totalTickets / uniqueUsers).toFixed(1) : 0} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Tabs defaultValue="user" onValueChange={(v) => setActiveTab(v as ReportType)}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Per User</TabsTrigger>
            <TabsTrigger value="department">Per Department</TabsTrigger>
        </TabsList>
        <TabsContent value="user" className="mt-4">
            <ReportTable 
                title="Prints by User"
                data={userReportData}
                headers={["Employee", "Tickets Printed"]}
            />
        </TabsContent>
        <TabsContent value="department" className="mt-4">
            <ReportTable 
                title="Prints by Department"
                data={departmentReportData}
                headers={["Department", "Tickets Printed"]}
            />
        </TabsContent>
      </Tabs>
    </div>
  )
}
