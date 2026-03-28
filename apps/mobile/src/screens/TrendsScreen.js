import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useCrowdData } from '../hooks/useCrowdData';
import { useZones } from '../hooks/useZones';
import ConnectionBanner from '../components/ConnectionBanner';

const { width } = Dimensions.get('window');
const CHART_W = width - 64;
const CHART_H = 140;
const TIME_FILTERS = ['1H', '6H', '24H'];

function LiveLineChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <View style={{ width: CHART_W, height: CHART_H + 24, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Collecting data…</Text>
      </View>
    );
  }

  // Sample at most 20 points for clarity
  const step = Math.max(1, Math.floor(history.length / 20));
  const sampled = history.filter((_, i) => i % step === 0);
  const max = Math.max(...sampled);
  const min = Math.min(...sampled);
  const range = max - min || 1;

  const criticalValue = 16; // from zone_manager thresholds
  const criticalY = CHART_H - ((criticalValue - min) / range) * CHART_H;

  const points = sampled.map((v, i) => ({
    x: (i / (sampled.length - 1)) * CHART_W,
    y: CHART_H - ((v - min) / range) * CHART_H,
  }));

  return (
    <View style={{ width: CHART_W, height: CHART_H + 24, position: 'relative' }}>
      {/* Critical threshold line */}
      {criticalY >= 0 && criticalY <= CHART_H && (
        <View style={[styles.criticalLine, { top: criticalY }]}>
          <Text style={styles.criticalLineLabel}>CRITICAL</Text>
        </View>
      )}
      {/* Chart line segments */}
      {points.map((p, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={{
            position: 'absolute', left: prev.x, top: prev.y,
            width: len, height: 2.5, backgroundColor: Colors.cyan,
            transform: [{ rotate: `${angle}deg` }], transformOrigin: '0 0',
          }} />
        );
      })}
      {/* Glow dots */}
      {points.map((p, i) => (
        <View key={`d${i}`} style={{
          position: 'absolute', left: p.x - 3, top: p.y - 3,
          width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan,
          shadowColor: Colors.cyan, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8, shadowRadius: 4,
        }} />
      ))}
      {/* Time axis labels */}
      <View style={{ position: 'absolute', top: CHART_H + 6, flexDirection: 'row', justifyContent: 'space-between', width: CHART_W }}>
        <Text style={styles.chartTimeLabel}>older</Text>
        <Text style={styles.chartTimeLabel}>now</Text>
      </View>
    </View>
  );
}

function CapacityBar({ zone }) {
  const color = zone.capacityPct >= 90 ? Colors.critical
    : zone.capacityPct >= 55 ? Colors.warning
    : Colors.stable;

  return (
    <View style={styles.capacityRow}>
      <View style={styles.capacityLeft}>
        <Text style={styles.capacityZoneName}>{zone.name}</Text>
        <Text style={styles.capacityLocation}>{zone.fullName.split('— ')[1] || ''}</Text>
      </View>
      <View style={styles.capacityRight}>
        <Text style={[styles.capacityPct, { color }]}>{zone.capacityPct}% Capacity</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${zone.capacityPct}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const [timeFilter, setTimeFilter] = useState('1H');
  const { history, totalCount, peakCount, avgCount } = useCrowdData();
  const { zones } = useZones();

  const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>((·))</Text>
          <Text style={styles.logoText}>CROWDSENSE</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Text style={styles.iconText}>🔍</Text></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Text style={styles.iconText}>⋮</Text></TouchableOpacity>
        </View>
      </View>

      <ConnectionBanner />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text style={styles.pageTitle}>Crowd Trends</Text>
        <Text style={styles.pageSubtitle}>Real-time analytical telemetry — Live WebSocket feed</Text>

        <View style={styles.filterRow}>
          {TIME_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setTimeFilter(f)}
              style={[styles.filterTab, timeFilter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats cards — live data */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>PEAK</Text>
              <Text style={styles.statIcon}>↗</Text>
            </View>
            <Text style={styles.statValue}>{formatCount(peakCount)}</Text>
            <Text style={styles.statUnit}>people</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>AVERAGE</Text>
              <Text style={styles.statIcon}>▐▌</Text>
            </View>
            <Text style={styles.statValue}>{formatCount(avgCount)}</Text>
            <Text style={styles.statUnit}>people</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>CURRENT</Text>
              <View style={styles.liveDot} />
            </View>
            <Text style={[styles.statValue, { color: Colors.cyan }]}>{totalCount}</Text>
            <Text style={styles.statUnit}>people</Text>
          </View>
        </View>

        {/* Live history chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>↗  DENSITY HISTORY</Text>
            <Text style={styles.chartUpdated}>Live · {history.length} pts</Text>
          </View>
          <View style={{ paddingTop: 12 }}>
            <LiveLineChart history={history} />
          </View>
        </View>

        {/* Zone comparison — live capacities */}
        {zones && (
          <View style={styles.zoneSection}>
            <View style={styles.zoneSectionHeader}>
              <Text style={styles.zoneSectionTitle}>ZONE COMPARISON</Text>
            </View>
            {zones.map((z, i) => (
              <CapacityBar key={z.id} zone={z} />
            ))}
          </View>
        )}

        {/* Heatmap teaser */}
        <View style={styles.heatmapCard}>
          <View style={styles.heatmapGradient}>
            {[
              { left: '20%', top: '30%', color: 'rgba(255,80,0,0.6)', size: 80 },
              { left: '45%', top: '20%', color: 'rgba(0,200,100,0.5)', size: 60 },
              { left: '60%', top: '50%', color: 'rgba(255,180,0,0.4)', size: 50 },
            ].map((spot, i) => (
              <View key={i} style={{
                position: 'absolute', left: spot.left, top: spot.top,
                width: spot.size, height: spot.size,
                borderRadius: spot.size / 2, backgroundColor: spot.color,
              }} />
            ))}
          </View>
          <View style={styles.heatmapTag}>
            <View style={[styles.dot, { backgroundColor: Colors.stable }]} />
            <Text style={styles.heatmapTagText}>LIVE SPATIAL HEATMAP</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  logoText: { color: Colors.cyan, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  iconText: { color: Colors.textSecondary, fontSize: 16 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  pageTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 20 },
  pageSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterTab: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.cyan, borderColor: Colors.cyan },
  filterText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: Colors.bg },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  statIcon: { color: Colors.textMuted, fontSize: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.stable },
  statValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  statUnit: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  chartCard: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { color: Colors.cyan, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  chartUpdated: { color: Colors.textMuted, fontSize: 11 },
  criticalLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,59,48,0.3)',
  },
  criticalLineLabel: { color: Colors.critical, fontSize: 9, fontWeight: '700', position: 'absolute', right: 0, top: -10, letterSpacing: 0.5 },
  chartTimeLabel: { color: Colors.textMuted, fontSize: 9 },
  zoneSection: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  zoneSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  zoneSectionTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  capacityLeft: { width: 80 },
  capacityZoneName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  capacityLocation: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  capacityRight: { flex: 1, marginLeft: 12 },
  capacityPct: { fontSize: 11, fontWeight: '700', marginBottom: 4, textAlign: 'right' },
  barBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  heatmapCard: {
    height: 130, backgroundColor: '#0B1118', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, justifyContent: 'flex-end', padding: 14,
  },
  heatmapGradient: { position: 'absolute', width: '100%', height: '100%' },
  heatmapTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  heatmapTagText: { color: Colors.stable, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});
