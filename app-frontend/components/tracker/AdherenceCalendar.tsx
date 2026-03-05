import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, HeatmapColors, Shadows } from '@/constants/theme';

interface HeatmapDay {
  date: string;
  completion_ratio: number;
}

interface AdherenceCalendarProps {
  month: string; // YYYY-MM
  days: HeatmapDay[];
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  canGoNext?: boolean;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AdherenceCalendar({ month, days, onPrevMonth, onNextMonth, canGoNext = true }: AdherenceCalendarProps) {
  const today = getTodayStr();
  const colorScheme = useColorScheme();
  const mode = colorScheme ?? 'light';
  const colors = Colors[mode];
  const heatColors = HeatmapColors[mode];
  const shadows = Shadows[mode];

  const getHeatColor = (ratio: number): string => {
    if (ratio === 0) return heatColors[0];
    if (ratio <= 0.25) return heatColors[1];
    if (ratio <= 0.5) return heatColors[2];
    if (ratio <= 0.75) return heatColors[3];
    return heatColors[4];
  };

  const getTextColor = (ratio: number): string => {
    if (ratio > 0.75) return mode === 'dark' ? colors.textInverse : '#FFFFFF';
    return colors.textSecondary;
  };

  const calendarGrid = useMemo(() => {
    const ratioMap = new Map<string, number>();
    for (const day of days) {
      ratioMap.set(day.date, day.completion_ratio);
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const mon = parseInt(monthStr);

    const firstDate = new Date(year, mon - 1, 1);
    const firstDayOfWeek = firstDate.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInMonth = new Date(year, mon, 0).getDate();

    const weeks: (null | { day: number; dateStr: string; ratio: number })[][] = [];
    let currentWeek: (null | { day: number; dateStr: string; ratio: number })[] = [];

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

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [month, days]);

  const monthLabel = useMemo(() => {
    const [yearStr, monthStr] = month.split('-');
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Adherence</Text>
      <View style={[
        styles.calendarCard,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
        shadows.card,
      ]}>
        <View style={styles.monthNav}>
          <Pressable onPress={onPrevMonth} style={styles.navArrow} hitSlop={8}>
            <Text style={[styles.navArrowText, { color: colors.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>
          <Pressable
            onPress={canGoNext ? onNextMonth : undefined}
            style={[styles.navArrow, !canGoNext && styles.navArrowDisabled]}
            hitSlop={8}
          >
            <Text style={[styles.navArrowText, { color: canGoNext ? colors.text : colors.textTertiary }]}>›</Text>
          </Pressable>
        </View>

        {/* Day headers */}
        <View style={styles.row}>
          {DAY_LABELS.map((label) => (
            <View key={label} style={styles.cell}>
              <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>{label}</Text>
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
              const bgColor = isFuture ? colors.backgroundTertiary : getHeatColor(cell.ratio);
              const textColor = isFuture ? colors.textTertiary : getTextColor(cell.ratio);

              return (
                <View key={cellIdx} style={styles.cell}>
                  <View
                    style={[
                      styles.daySquare,
                      { backgroundColor: bgColor },
                      isToday && { borderWidth: 2, borderColor: colors.todayBorder },
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
        <View style={[styles.legend, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Less</Text>
          {heatColors.map((color, i) => (
            <View key={i} style={[styles.legendSquare, { backgroundColor: color }]} />
          ))}
          <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>More</Text>
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
    marginBottom: 14,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navArrowText: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    textTransform: 'uppercase',
  },
  daySquare: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  legendLabel: {
    fontSize: 11,
  },
  legendSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});
