import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/colors';
import { formatNaira } from '../../utils/currency';
import { BorderRadius, Shadows } from '../../constants/spacing';

const { width } = Dimensions.get('window');

interface RevenueDataPoint {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const CHART_HEIGHT = 140;

  return (
    <View style={[styles.container, Shadows.card]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Monthly Revenue Summary</Text>
          <Text style={styles.subtitle}>Last 6 months performance</Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Sales (₦)</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const barHeight = (item.amount / maxAmount) * CHART_HEIGHT;
          const isLatest = index === data.length - 1;

          return (
            <View key={item.month} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: isLatest ? Colors.accentOrange : Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.monthLabel, isLatest && styles.activeMonthLabel]}>
                {item.month}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 130,
    width: 22,
    backgroundColor: '#F3E8FF',
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  monthLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  activeMonthLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default RevenueChart;
