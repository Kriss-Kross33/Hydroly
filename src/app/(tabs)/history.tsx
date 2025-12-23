import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useWater } from '@/contexts/WaterContext';
import { Calendar, Droplet, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';

export default function HistoryScreen() {
  const { records, dailyGoal, getAllDatesWithData } = useWater();
  const dates = getAllDatesWithData();

  const stats = useMemo(() => {
    const recordsArray = Object.values(records);
    const totalDays = recordsArray.length;
    const completedDays = recordsArray.filter((r) => r.total >= dailyGoal.goal).length;
    const totalWater = recordsArray.reduce((sum, r) => sum + r.total, 0);
    const avgDaily = totalDays > 0 ? totalWater / totalDays : 0;
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      const record = records[dateKey];
      
      if (record && record.total >= dailyGoal.goal) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalDays,
      completedDays,
      avgDaily: Math.round(avgDaily),
      currentStreak,
    };
  }, [records, dailyGoal]);

  const getProgressColor = (total: number, goal: number) => {
    const percentage = (total / goal) * 100;
    if (percentage >= 100) return '#10B981';
    if (percentage >= 75) return '#3B82F6';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <TrendingUp size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Calendar size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{stats.completedDays}</Text>
          <Text style={styles.statLabel}>Goals Met</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
            <Droplet size={24} color="#0EA5E9" />
          </View>
          <Text style={styles.statValue}>{stats.avgDaily}</Text>
          <Text style={styles.statLabel}>Avg ml/day</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily History</Text>
        {dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No history yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your water intake to see your history</Text>
          </View>
        ) : (
          dates.map((dateKey) => {
            const record = records[dateKey];
            const date = new Date(dateKey);
            const isToday = dateKey === new Date().toISOString().split('T')[0];
            const percentage = (record.total / record.goal) * 100;
            
            return (
              <View key={dateKey} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={styles.dayDate}>
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </Text>
                    {isToday && <Text style={styles.todayBadge}>Today</Text>}
                  </View>
                  <View style={styles.dayStats}>
                    <Text style={[styles.dayTotal, { color: getProgressColor(record.total, record.goal) }]}>
                      {record.total}ml
                    </Text>
                    <Text style={styles.dayGoal}>/ {record.goal}ml</Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: getProgressColor(record.total, record.goal),
                      }
                    ]} 
                  />
                </View>

                <View style={styles.entriesContainer}>
                  {record.entries.map((entry) => (
                    <View key={entry.id} style={styles.entryDot}>
                      <Droplet size={12} color="#0EA5E9" fill="#0EA5E9" />
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#0C4A6E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0C4A6E',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0C4A6E',
    marginBottom: 4,
  },
  todayBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#0EA5E9',
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  dayTotal: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  dayGoal: {
    fontSize: 14,
    color: '#94A3B8',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  entriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  entryDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
