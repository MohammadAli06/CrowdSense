import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAlerts } from '../hooks/useAlerts';
import ConnectionBanner from '../components/ConnectionBanner';

const FILTERS = ['All', 'High', 'Med', 'Low'];

// Map backend severity → UI colors
const SEVERITY_COLOR = {
  High: Colors.critical,
  Med: Colors.warning,
  Low: Colors.cyan,
};
const SEVERITY_BG = {
  High: Colors.criticalBg,
  Med: Colors.warningBg,
  Low: Colors.advisoryBg,
};

function timeAgo(timestampStr) {
  // timestamps come as "HH:MM:SS" from the backend
  if (!timestampStr) return '';
  return timestampStr;
}

function AlertCard({ alert }) {
  const color = SEVERITY_COLOR[alert.severity] || Colors.textMuted;
  const bg = SEVERITY_BG[alert.severity] || 'transparent';
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTags}>
          {alert.zone !== 'ALL' && (
            <View style={[styles.tag, { borderColor: color, borderWidth: 1 }]}>
              <Text style={[styles.tagText, { color }]}>ZONE {alert.zone}</Text>
            </View>
          )}
          <View style={[styles.tag, { backgroundColor: bg }]}>
            <Text style={[styles.tagText, { color }]}>{alert.severity.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{timeAgo(alert.timestamp)}</Text>
      </View>
      <Text style={styles.cardMessage}>{alert.message}</Text>
    </View>
  );
}

export default function AlertsScreen() {
  const [filter, setFilter] = useState('All');

  // Map tab filter to backend severity string
  const severityMap = { High: 'High', Med: 'Med', Low: 'Low' };
  const severityFilter = filter === 'All' ? null : severityMap[filter];

  const { alerts, activeCount } = useAlerts(severityFilter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>((·))</Text>
          <Text style={styles.logoText}>CROWDSENSE</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, { width: 18 }]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      <ConnectionBanner />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Live Alerts</Text>
          <View style={[styles.activeBadge, { backgroundColor: activeCount > 0 ? Colors.critical : Colors.bgCard }]}>
            <Text style={styles.activeText}>{activeCount} ACTIVE</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alert list */}
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySubtitle}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}alerts at this time</Text>
          </View>
        ) : (
          alerts.map(a => <AlertCard key={a.id} alert={a} />)
        )}

        {/* Map preview card */}
        <View style={styles.mapPreview}>
          <View style={styles.mapBg}>
            {[...Array(60)].map((_, i) => (
              <View key={i} style={[styles.mapDot, {
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: (i % 5) * 0.08 + 0.05,
              }]} />
            ))}
          </View>
          <View style={styles.mapOverlay}>
            <View style={styles.openMapBtn}>
              <Text style={styles.openMapText}>OPEN FULL MAP</Text>
            </View>
          </View>
          <View style={styles.mapFooter}>
            <View style={[styles.dot, { backgroundColor: Colors.stable }]} />
            <Text style={styles.mapLabel}>LIVE COVERAGE</Text>
          </View>
          <Text style={styles.mapTitle}>Stadium Perimeter Matrix</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  logoText: { color: Colors.cyan, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  menuBtn: { gap: 4, alignItems: 'flex-end' },
  menuLine: { width: 22, height: 2, backgroundColor: Colors.textSecondary, borderRadius: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 16 },
  pageTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  activeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterTab: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.cyan, borderColor: Colors.cyan },
  filterText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: Colors.bg },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeText: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },
  cardMessage: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 36, color: Colors.stable },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 13 },
  mapPreview: {
    width: '100%', height: 180, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#0D1520', marginTop: 8,
  },
  mapBg: { position: 'absolute', width: '100%', height: '100%' },
  mapDot: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: Colors.textSecondary },
  mapOverlay: { position: 'absolute', top: 12, right: 12 },
  openMapBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  openMapText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  mapFooter: { position: 'absolute', bottom: 36, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  mapLabel: { color: Colors.stable, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  mapTitle: { position: 'absolute', bottom: 14, left: 14, color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
});
