'use client';

import type { FeedingRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';

interface FeedingHistoryProps {
  records: FeedingRecord[];
}

export default function FeedingHistory({ records }: FeedingHistoryProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <History /> Recent Prints
        </CardTitle>
        <CardDescription>A log of recently printed tickets.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-[360px]">
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {record.timestamp.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-muted-foreground">No recent prints.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
