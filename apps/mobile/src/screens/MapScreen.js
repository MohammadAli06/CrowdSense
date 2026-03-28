import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, Animated,
} from 'react-native';
import { Colors } from '../theme/colors';
import { zones } from '../data/mockData';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;

const statusColor = {
  STABLE: Colors.stable,
  MODERATE: Colors.warning,
  DENSE: Colors.warning,
  CRITICAL: Colors.critical,
};

function ZoneMarker({ zone, onPress, mapWidth, mapHeight }) {
  const color = statusColor[zone.status];
  const x = zone.x * mapWidth - 22;
  const y = zone.y * mapHeight - 22;

  return (
    <TouchableOpacity
      style={[styles.markerContainer, { left: x, top: y }]}
      onPress={() => onPress(zone)}
    >
      <View style={[styles.markerOuter, { borderColor: color + '55' }]}>
        <View style={[styles.markerInner, { backgroundColor: color }]} />
      </View>
      <View style={[styles.markerLabel, { backgroundColor: color }]}>
        <Text style={styles.markerLabelText}>{zone.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ZoneCard({ zone, onPress }) {
  const color = statusColor[zone.status];
  return (
    <TouchableOpacity
      style={[styles.zoneCard, { borderTopColor: color }]}
      onPress={() => onPress(zone)}
      activeOpacity={0.8}
    >
      <View style={styles.zoneCardHeader}>
        <Text style={styles.zoneCardName}>{zone.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={[styles.statusText, { color }]}>{zone.status}</Text>
        </View>
      </View>
      <Text style={styles.zoneCount}>{zone.people.toLocaleString()}</Text>
      <Text style={styles.zonePeopleLabel}>PEOPLE</Text>
    </TouchableOpacity>
  );
}

export default function MapScreen({ navigation }) {
  const [mapDim, setMapDim] = useState({ width: width, height: MAP_HEIGHT });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>((·))</Text>
          <Text style={styles.logoText}>CROWDSENSE</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: Colors.bgCard }]}>
          <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>👤</Text>
        </View>
      </View>

      {/* Critical banner */}
      <View style={styles.criticalBanner}>
        <View style={styles.criticalDot} />
        <Text style={styles.criticalText}>CRITICAL — Overcrowding Detected in Zone D</Text>
      </View>

      {/* Map area */}
      <View
        style={styles.mapArea}
        onLayout={e => setMapDim({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        <View style={styles.mapBg}>
          {/* Grid lines */}
          {[...Array(8)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, { top: (i / 8) * mapDim.height }]} />
          ))}
          {[...Array(8)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: (i / 8) * mapDim.width }]} />
          ))}
        </View>

        {zones.map(zone => (
          <ZoneMarker
            key={zone.id}
            zone={zone}
            onPress={z => navigation.navigate('ZoneDetail', { zone: z })}
            mapWidth={mapDim.width}
            mapHeight={mapDim.height}
          />
        ))}
      </View>

      {/* Zone Status bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetTitleRow}>
          <View>
            <Text style={styles.sheetTitle}>Zone Status</Text>
            <Text style={styles.sheetSubtitle}>Real-time occupancy metrics</Text>
          </View>
          <View style={styles.liveTag}>
            <Text style={styles.liveTagText}>LIVE UPDATES</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        >
          {zones.map(zone => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onPress={z => navigation.navigate('ZoneDetail', { zone: z })}
            />
          ))}
        </ScrollView>
      </View>
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
    paddingBottom: 12,
    zIndex: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  logoText: { color: Colors.cyan, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: Colors.criticalBg,
    borderWidth: 1,
    borderColor: Colors.critical + '60',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  criticalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.critical,
  },
  criticalText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0B1118',
  },
  mapBg: { position: 'absolute', width: '100%', height: '100%' },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  gridLineV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  markerLabel: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markerLabelText: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomSheet: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  liveTag: {
    borderWidth: 1,
    borderColor: Colors.cyan,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveTagText: { color: Colors.cyan, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  zoneCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    width: 140,
    borderTopWidth: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  zoneCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneCardName: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  zoneCount: { color: Colors.textPrimary, fontSize: 30, fontWeight: '800' },
  zonePeopleLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
