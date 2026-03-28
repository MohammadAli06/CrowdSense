import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { alerts } from '../data/mockData';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'High', 'Med', 'Low'];

const severityColor = {
  high: Colors.critical,
  medium: Colors.warning,
  low: Colors.cyan,
};

const severityBg = {
  high: Colors.criticalBg,
  medium: Colors.warningBg,
  low: Colors.advisoryBg,
};

function AlertCard({ alert }) {
  const color = severityColor[alert.severityLevel];
  const bg = severityBg[alert.severityLevel];
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTags}>
          <View style={[styles.tag, { backgroundColor: 'transparent', borderColor: color, borderWidth: 1 }]}>
            <Text style={[styles.tagText, { color }]}>{alert.zone}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: bg }]}>
            <Text style={[styles.tagText, { color }]}>{alert.severity}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{alert.time}</Text>
      </View>
      <Text style={styles.cardMessage}>{alert.message}</Text>
      {alert.metric && (
        <View style={styles.cardMeta}>
          <Text style={styles.metricText}>👥  {alert.metric}</Text>
          {alert.trend && (
            <Text style={[styles.metricText, { color: Colors.stable }]}>  ↗  {alert.trend}</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function AlertsScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = alerts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'High') return a.severityLevel === 'high';
    if (filter === 'Med') return a.severityLevel === 'medium';
    if (filter === 'Low') return a.severityLevel === 'low';
  });

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

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Live Alerts</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>12 ACTIVE</Text>
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

        {/* Alert cards */}
        {filtered.map(a => <AlertCard key={a.id} alert={a} />)}

        {/* Map preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapBg}>
            {/* Simple world map dots */}
            {[...Array(60)].map((_, i) => (
              <View
                key={i}
                style={[styles.mapDot, {
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  opacity: Math.random() * 0.4 + 0.1,
                }]}
              />
            ))}
          </View>
          <View style={styles.mapOverlay}>
            <TouchableOpacity style={styles.openMapBtn}>
              <Text style={styles.openMapText}>OPEN FULL MAP</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  logoText: { color: Colors.cyan, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  menuBtn: { gap: 4, alignItems: 'flex-end' },
  menuLine: { width: 22, height: 2, backgroundColor: Colors.textSecondary, borderRadius: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  activeBadge: {
    backgroundColor: Colors.critical,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  filterText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: Colors.bg },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeText: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },
  cardMessage: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  metricText: { color: Colors.textSecondary, fontSize: 12 },
  mapPreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0D1520',
    marginTop: 8,
  },
  mapBg: { position: 'absolute', width: '100%', height: '100%' },
  mapDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textSecondary,
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  openMapBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openMapText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  mapFooter: {
    position: 'absolute',
    bottom: 36,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  mapLabel: { color: Colors.stable, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  mapTitle: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
