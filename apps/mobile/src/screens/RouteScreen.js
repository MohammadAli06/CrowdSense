import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import ConnectionBanner from '../components/ConnectionBanner';

const { width } = Dimensions.get('window');

export default function RouteScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
         <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>((·))</Text>
          <Text style={styles.logoText}>CROWDSENSE</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: Colors.bgCard }]}>
             <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>👤</Text>
          </View>
        </View>
      </View>

      <ConnectionBanner />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Safe Route</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE ALPHA</Text>
          </View>
        </View>

        {/* Location Inputs */}
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={styles.locIconContainer}>
               <Text style={styles.locIcon}>⦿</Text>
            </View>
            <View style={styles.locInput}>
               <Text style={styles.locText}>Current Location</Text>
            </View>
          </View>
          <View style={styles.connector} />
          <View style={styles.locationRow}>
            <View style={styles.locIconContainer}>
               <Text style={[styles.locIcon, { color: '#E53935' }]}>📍</Text>
            </View>
            <View style={styles.locInput}>
               <Text style={styles.locText}>Central Plaza Metro</Text>
            </View>
          </View>
        </View>

        {/* Route Map Preview */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
             <View style={styles.tag}>
                <View style={styles.dot} />
                <Text style={styles.tagText}>LIVE TELEMETRY</Text>
             </View>
          </View>
          
          <View style={styles.mapVisual}>
             {/* Fake map/compass/route background */}
             <View style={styles.compassLine} />
             <View style={styles.compassLineV} />
             <View style={[styles.zoneCircle, { width: 100, height: 100, opacity: 0.15, top: 40, left: 40, backgroundColor: '#E53935' }]} />
             <View style={[styles.zoneCircle, { width: 60, height: 60, opacity: 0.1, bottom: 40, right: 60, backgroundColor: '#E53935' }]} />

             <Svg width="100%" height="100%" viewBox="0 0 200 200" style={styles.routeSvg}>
                <Path
                  d="M 30,150 L 80,150 L 80,110 L 140,110 L 140,70 L 180,70"
                  fill="none"
                  stroke={Colors.cyan}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <Circle cx="30" cy="150" r="4" fill={Colors.cyan} />
                <Circle cx="180" cy="70" r="4" fill={Colors.cyan} />
             </Svg>
             
             <Text style={styles.brandOverlay}>SAVEGCON</Text>
          </View>
          
          <View style={styles.mapControls}>
             <TouchableOpacity style={styles.controlBtn}><Text style={styles.controlBtnText}>+</Text></TouchableOpacity>
             <TouchableOpacity style={styles.controlBtn}><Text style={styles.controlBtnText}>—</Text></TouchableOpacity>
          </View>
        </View>

        {/* Estimated Time Card */}
        <View style={styles.infoCard}>
           <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                 <Text style={styles.walkIcon}>🚶</Text>
              </View>
              <View style={styles.infoRight}>
                 <Text style={styles.infoLabel}>ESTIMATED TIME</Text>
                 <View style={styles.infoValues}>
                    <Text style={styles.infoBig}>8 min</Text>
                    <Text style={styles.infoSmall}>0.6 km</Text>
                 </View>
              </View>
              <View style={styles.routeDecor}>
                 <Text style={styles.decorText}>ហ</Text>
              </View>
           </View>
        </View>

        {/* Safety Feedback */}
        <View style={styles.safetyFeedback}>
           <View style={styles.safetyIcon}>
              <Text style={styles.shieldIcon}>🛡️</Text>
           </View>
           <Text style={styles.safetyText}>Avoids 2 high-density zones along the path</Text>
        </View>

        {/* Find Safe Route Button */}
        <TouchableOpacity style={styles.findBtn} activeOpacity={0.85}>
           <Text style={styles.findBtnText}>Find Safe Route</Text>
           <Text style={styles.findBtnIcon}>➤</Text>
        </TouchableOpacity>

        <Text style={styles.footerBrand}>POWERED BY CROWDSENSE REAL-TIME MESH</Text>
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
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  iconText: { color: Colors.textSecondary, fontSize: 18 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: { color: Colors.textPrimary, fontSize: 32, fontWeight: '800' },
  liveBadge: {
    backgroundColor: '#002B2B',
    borderWidth: 1,
    borderColor: Colors.stable,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveBadgeText: { color: Colors.stable, fontSize: 10, fontWeight: '800' },
  locationContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locIconContainer: { width: 24, alignItems: 'center' },
  locIcon: { color: Colors.cyan, fontSize: 18 },
  locInput: { flex: 1 },
  locText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  connector: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 11,
    marginVertical: 4,
  },
  mapCard: {
    backgroundColor: '#0B1118',
    borderRadius: 20,
    height: 280,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  mapHeader: { padding: 16, zIndex: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,28,37,0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.stable },
  tagText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  mapVisual: { flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  compassLine: { position: 'absolute', width: '90%', height: 1, backgroundColor: 'rgba(255,59,48,0.2)' },
  compassLineV: { position: 'absolute', width: 1, height: '90%', backgroundColor: 'rgba(255,59,48,0.2)' },
  zoneCircle: { position: 'absolute', borderRadius: 999 },
  routeSvg: { position: 'absolute', width: '100%', height: '100%' },
  brandOverlay: { position: 'absolute', bottom: 12, color: Colors.textMuted, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  mapControls: { position: 'absolute', bottom: 16, right: 16, gap: 8 },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: { color: Colors.textPrimary, fontSize: 20, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E313D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  walkIcon: { fontSize: 24 },
  infoRight: { flex: 1 },
  infoLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  infoValues: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 },
  infoBig: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  infoSmall: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
  routeDecor: { opacity: 0.2 },
  decorText: { color: Colors.textPrimary, fontSize: 40 },
  safetyFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  safetyIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: { fontSize: 14 },
  safetyText: { color: Colors.stable, fontSize: 13, fontWeight: '600', flex: 1 },
  findBtn: {
    backgroundColor: Colors.cyan,
    borderRadius: 24,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  findBtnText: { color: Colors.bg, fontSize: 18, fontWeight: '800' },
  findBtnIcon: { color: Colors.bg, fontSize: 18, transform: [{ rotate: '-45deg' }] },
  footerBrand: { color: Colors.textMuted, fontSize: 9, textAlign: 'center', letterSpacing: 2, fontWeight: '700' },
});
