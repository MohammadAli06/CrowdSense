import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useZones } from '../hooks/useZones';
import { zoneDetail as mockDetail } from '../data/mockData'; // fallback for chart structure

const { width } = Dimensions.get('window');

// Map backend heatmap labels to grid colors
const HEAT_COLOR = {
  low: '#34C759',
  med: '#FF9F0A',
  high: '#FF6B35',
  critical: '#FF453A',
};

function SimpleLineChart({ data }) {
  const W = width - 64;
  const H = 80;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * H,
  }));

  return (
    <View style={{ width: W, height: H + 20 }}>
      <View style={{ width: W, height: H, position: 'relative' }}>
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
              width: len, height: 2, backgroundColor: Colors.cyan,
              transform: [{ rotate: `${angle}deg` }], transformOrigin: '0 0',
            }} />
          );
        })}
        {points.map((p, i) => (
          <View key={`d${i}`} style={{
            position: 'absolute', left: p.x - 3, top: p.y - 3,
            width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan,
          }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <Text key={i} style={styles.chartLabel}>{d.time}</Text>
        ))}
      </View>
    </View>
  );
}

export default function ZoneDetailScreen({ route, navigation }) {
  const passedZone = route?.params?.zone;
  const { zones, heatmap } = useZones();

  // Find the live zone data for this zone id
  const liveZone = zones?.find(z => z.id === passedZone?.id) ?? passedZone;

  // Use heatmap from backend if available, else mock
  const displayHeatmap = heatmap ?? null;

  const people = liveZone?.people ?? passedZone?.people ?? 0;
  const zoneStatus = liveZone?.status ?? passedZone?.status ?? 'STABLE';
  const statusColor = liveZone?.color ?? passedZone?.color ?? Colors.stable;
  const zoneName = liveZone?.fullName ?? passedZone?.fullName ?? 'Zone Detail';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{zoneName}</Text>
        <Text style={styles.signalIcon}>((·))</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Count card */}
        <View style={styles.countCard}>
          <View style={[styles.densityBadge, { borderColor: statusColor + '80' }]}>
            <View style={[styles.densityDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.densityBadgeText, { color: statusColor }]}>{zoneStatus}</Text>
          </View>
          <Text style={styles.countNumber}>{people.toLocaleString()}</Text>
          <Text style={styles.countLabel}>PEOPLE CURRENTLY</Text>
          <View style={styles.refreshRow}>
            <Text style={styles.refreshText}>Live WebSocket feed</Text>
            <View style={[styles.liveIndicator, { backgroundColor: Colors.stable }]} />
          </View>
        </View>

        {/* Density heatmap — from backend or mock */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DENSITY MAP</Text>
            <Text style={styles.sectionTag}>LIVE TELEMETRY</Text>
          </View>
          <View style={styles.grid}>
            {displayHeatmap ? (
              // Backend: 4 rows × 6 cols
              displayHeatmap.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map((cell, ci) => (
                    <View key={ci} style={[styles.gridCell, { backgroundColor: HEAT_COLOR[cell] || Colors.bgCard }]} />
                  ))}
                </View>
              ))
            ) : (
              // Mock fallback: 4×4
              mockDetail.densityGrid.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map((cell, ci) => (
                    <View key={ci} style={[styles.gridCell, { backgroundColor: HEAT_COLOR[cell] || Colors.bgCard }]} />
                  ))}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Last hour chart (mock structure, real-looking) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT TREND</Text>
            <Text style={[styles.sectionTag, { color: Colors.stable }]}>LIVE</Text>
          </View>
          <View style={styles.chartCard}>
            <SimpleLineChart data={mockDetail.chartData} />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PEAK TIME</Text>
            <Text style={styles.statValue}>{mockDetail.peakTime}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>EVAC ROUTE</Text>
            <Text style={[styles.statValue, { color: Colors.stable }]}>{mockDetail.evacRoute}</Text>
          </View>
        </View>

        {/* Live feed banner */}
        <View style={styles.liveFeedCard}>
          <View style={styles.liveFeedOverlay} />
          <View style={styles.liveFeedTag}>
            <View style={[styles.dot, { backgroundColor: Colors.stable }]} />
            <Text style={styles.liveFeedText}>LIVEFEED: C8-NORTH</Text>
          </View>
        </View>
      </ScrollView>

      {/* Avoid zone CTA — coloured by live severity */}
      <View style={styles.footerBtn}>
        <TouchableOpacity
          style={[styles.avoidBtn, { backgroundColor: liveZone?.rawStatus === 'Critical' ? Colors.critical : Colors.bgCard }]}
          activeOpacity={0.85}
        >
          <Text style={styles.avoidIcon}>🚫</Text>
          <Text style={[styles.avoidText, { color: liveZone?.rawStatus === 'Critical' ? '#fff' : Colors.textSecondary }]}>
            {liveZone?.rawStatus === 'Critical' ? 'Avoid this zone' : 'Zone is safe'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { color: Colors.textPrimary, fontSize: 20 },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  signalIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  countCard: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 20,
    marginTop: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  densityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end',
    backgroundColor: Colors.bgCardAlt, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 16, borderWidth: 1,
  },
  densityDot: { width: 6, height: 6, borderRadius: 3 },
  densityBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  countNumber: { color: Colors.textPrimary, fontSize: 60, fontWeight: '900', letterSpacing: -2 },
  countLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 2 },
  refreshRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  refreshText: { color: Colors.textMuted, fontSize: 11 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  sectionTag: { color: Colors.cyan, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  grid: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14,
    gap: 6, borderWidth: 1, borderColor: Colors.border,
  },
  gridRow: { flexDirection: 'row', gap: 6 },
  gridCell: { flex: 1, aspectRatio: 1, borderRadius: 6 },
  chartCard: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  chartLabel: { color: Colors.textMuted, fontSize: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  statValue: { color: Colors.cyan, fontSize: 22, fontWeight: '800' },
  liveFeedCard: {
    height: 120, backgroundColor: '#0B1118', borderRadius: 12, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'flex-end', padding: 12,
  },
  liveFeedOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(30,50,80,0.4)' },
  liveFeedTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  liveFeedText: { color: Colors.stable, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  footerBtn: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
    backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  avoidBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: Colors.border,
  },
  avoidIcon: { fontSize: 16 },
  avoidText: { fontSize: 16, fontWeight: '700' },
});
