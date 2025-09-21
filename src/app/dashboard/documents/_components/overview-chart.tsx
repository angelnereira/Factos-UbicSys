
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { FiscalDocument } from '@/lib/types';
import type { Timestamp } from 'firebase/firestore';

interface OverviewChartProps {
  documents: FiscalDocument[];
}

export function OverviewChart({ documents }: OverviewChartProps) {
  const data = documents.reduce((acc: { name: string; total: number }[], doc) => {
    const date = (doc.createdAt as Timestamp).toDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const monthYear = `${month} '${year}`;
    
    const existingMonth = acc.find(item => item.name === monthYear);

    if (existingMonth) {
      existingMonth.total++;
    } else {
      acc.push({ name: monthYear, total: 1 });
    }
    return acc;
  }, []);

  // Ensure chronological order if needed, though grouping usually works
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  data.sort((a, b) => {
    const [aMonth, aYear] = a.name.split(" '");
    const [bMonth, bYear] = b.name.split(" '");
    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
  });


  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}`}
          allowDecimals={false}
        />
        <Tooltip
            contentStyle={{ 
                background: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))', 
                borderRadius: 'var(--radius)'
            }}
            cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
