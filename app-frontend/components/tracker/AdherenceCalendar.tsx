import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeatmapDay {
  date: string;
  completion_ratio: number;
}

interface AdherenceCalendarProps {
  month: string; // YYYY-MM
  days: HeatmapDay[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 5-step intensity scale (0 → 4)
const HEAT_COLORS = [
  '#F5F5F5', // 0: no adherence
  '#E8DCC8', // 1: low
  '#D4C4A0', // 2: moderate
  '#B8A47A', // 3: good
  '#1A1A1A', // 4: full
];

function getHeatColor(ratio: number): string {
  if (ratio === 0) return HEAT_COLORS[0];
  if (ratio <= 0.25) return HEAT_COLORS[1];
  if (ratio <= 0.5) return HEAT_COLORS[2];
  if (ratio <= 0.75) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
}

function getTextColor(ratio: number): string {
  if (ratio > 0.75) return '#FFFFFF';
  return '#666666';
}

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AdherenceCalendar({ month, days }: AdherenceCalendarProps) {
  const today = getTodayStr();

  const calendarGrid = useMemo(() => {
    // Build a lookup for completion ratios
    const ratioMap = new Map<string, number>();
    for (const day of days) {
      ratioMap.set(day.date, day.completion_ratio);
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const mon = parseInt(monthStr);

    // First day of month: getDay() → 0=Sun..6=Sat
    // We want Mon=0..Sun=6
    const firstDate = new Date(year, mon - 1, 1);
    const firstDayOfWeek = firstDate.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = new Date(year, mon, 0).getDate();

    // Build weeks
    const weeks: (null | { day: number; dateStr: string; ratio: number })[][] = [];
    let currentWeek: (null | { day: number; dateStr: string; ratio: number })[] = [];

    // Leading empty cells
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`;
      currentWeek.push({
        day: d,
        dateStr,
        ratio: ratioMap.get(dateStr) ?? 0,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Trailing empty cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [month, days]);

  // Format month label
  const monthLabel = useMemo(() => {
    const [yearStr, monthStr] = month.split('-');
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Monthly Adherence</Text>
      <View style={styles.calendarCard}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>

        {/* Day headers */}
        <View style={styles.row}>
          {DAY_LABELS.map((label) => (
            <View key={label} style={styles.cell}>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {calendarGrid.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.row}>
            {week.map((cell, cellIdx) => {
              if (!cell) {
                return <View key={cellIdx} style={styles.cell} />;
              }

              const isFuture = cell.dateStr > today;
              const isToday = cell.dateStr === today;
              const bgColor = isFuture ? '#FAFAFA' : getHeatColor(cell.ratio);
              const textColor = isFuture ? '#D0D0D0' : getTextColor(cell.ratio);

              return (
                <View key={cellIdx} style={styles.cell}>
                  <View
                    style={[
                      styles.daySquare,
                      { backgroundColor: bgColor },
                      isToday && styles.todayBorder,
                    ]}
                  >
                    <Text style={[styles.dayNumber, { color: textColor }]}>
                      {cell.day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Less</Text>
          {HEAT_COLORS.map((color, i) => (
            <View key={i} style={[styles.legendSquare, { backgroundColor: color }]} />
          ))}
          <Text style={styles.legendLabel}>More</Text>
        </View>
      </View>
    </View>
  );
}

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
  },
  daySquare: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#A89B8C',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendLabel: {
    fontSize: 11,
    color: '#999999',
  },
  legendSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});
