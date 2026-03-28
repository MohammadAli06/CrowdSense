import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Switch, Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const SECTIONS = [
  {
    title: 'NOTIFICATIONS',
    items: [
      { id: 'push', label: 'Push Notifications', type: 'switch', value: true, icon: '🔔' },
      { id: 'sound', label: 'Sound Alerts', type: 'switch', value: false, icon: '🔊' },
    ],
  },
  {
    title: 'ALERT SENSITIVITY',
    items: [
       { id: 'sensitivity', type: 'segmented', options: ['High', 'Med', 'Any'], selected: 'High', desc: 'High: Only notify for critical density shifts (>85%).' }
    ]
  },
  {
     title: 'DATA & STORAGE',
     items: [
        { id: 'sync', label: 'Sync Frequency', type: 'link', value: 'Real-time', icon: '🔄' },
        { id: 'cache', label: 'Clear Cache', type: 'link', value: '124 MB', icon: '🗑️' }
     ]
  },
  {
     title: 'ABOUT',
     items: [
        { id: 'privacy', label: 'Privacy Policy', type: 'link', icon: '🛡️', external: true },
        { id: 'signout', label: 'Sign Out', type: 'link', icon: '🚪', color: Colors.critical }
     ]
  }
];

export default function SettingsScreen() {
  const [switches, setSwitches] = useState({ push: true, sound: false });
  const [sensitivity, setSensitivity] = useState('High');

  const toggleSwitch = (id) => setSwitches(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>((·))</Text>
          <Text style={styles.logoText}>CROWDSENSE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
           <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                 <Text style={styles.avatarImg}>👤</Text>
              </View>
           </View>
           <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Rivera</Text>
              <Text style={styles.profileRole}>Security Lead • Zone A</Text>
           </View>
           <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editIcon}>✏️</Text>
           </TouchableOpacity>
        </View>

        {SECTIONS.map((section, idx) => (
           <View key={idx} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                 {section.items.map((item, itemIdx) => (
                    <View key={item.id || itemIdx}>
                       {item.type === 'switch' && (
                          <View style={[styles.itemRow, itemIdx < section.items.length - 1 && styles.borderBottom]}>
                             <View style={styles.itemLeft}>
                                <Text style={styles.itemIcon}>{item.icon}</Text>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                             </View>
                             <Switch
                                value={switches[item.id]}
                                onValueChange={() => toggleSwitch(item.id)}
                                trackColor={{ false: '#3A4750', true: Colors.cyan }}
                                thumbColor={switches[item.id] ? '#fff' : '#8A9BB0'}
                             />
                          </View>
                       )}
                       {item.type === 'segmented' && (
                          <View style={styles.segmentedContainer}>
                             <View style={styles.segmentRow}>
                                {item.options.map(opt => (
                                   <TouchableOpacity
                                      key={opt}
                                      onPress={() => setSensitivity(opt)}
                                      style={[styles.segment, sensitivity === opt && styles.segmentActive]}
                                   >
                                      <Text style={[styles.segmentText, sensitivity === opt && styles.segmentTextActive]}>{opt}</Text>
                                   </TouchableOpacity>
                                ))}
                             </View>
                             <Text style={styles.segmentDesc}>{item.desc}</Text>
                          </View>
                       )}
                       {item.type === 'link' && (
                          <TouchableOpacity
                             style={[styles.itemRow, itemIdx < section.items.length - 1 && styles.borderBottom]}
                             activeOpacity={0.7}
                          >
                             <View style={styles.itemLeft}>
                                <Text style={[styles.itemIcon, item.color && { color: item.color }]}>{item.icon}</Text>
                                <Text style={[styles.itemLabel, item.id === 'signout' && { color: item.color }]}>{item.label}</Text>
                             </View>
                             <View style={styles.itemRight}>
                                {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                                <Text style={styles.arrowIcon}>{item.external ? '⤴' : '›'}</Text>
                             </View>
                          </TouchableOpacity>
                       )}
                    </View>
                 ))}
              </View>
           </View>
        ))}

        <Text style={styles.versionText}>CrowdSense v1.0.0 • Build 1</Text>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: Colors.cyan, fontSize: 14, fontWeight: '700' },
  logoText: { color: Colors.cyan, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 20,
  },
  profileCard: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: Colors.bgCard,
     borderRadius: 20,
     padding: 20,
     marginBottom: 32,
     borderWidth: 1,
     borderColor: Colors.border,
  },
  avatarContainer: {
     width: 64,
     height: 64,
     borderRadius: 32,
     borderWidth: 2,
     borderColor: Colors.cyan,
     padding: 2,
     marginRight: 16,
  },
  avatar: {
     flex: 1,
     borderRadius: 30,
     backgroundColor: '#2A3740',
     alignItems: 'center',
     justifyContent: 'center',
     overflow: 'hidden',
  },
  avatarImg: { fontSize: 32 },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  profileRole: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
     color: Colors.textMuted,
     fontSize: 12,
     fontWeight: '800',
     letterSpacing: 1.5,
     marginBottom: 12,
     marginLeft: 4,
  },
  sectionCard: {
     backgroundColor: Colors.bgCard,
     borderRadius: 16,
     borderWidth: 1,
     borderColor: Colors.border,
     overflow: 'hidden',
  },
  itemRow: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingHorizontal: 16,
     paddingVertical: 16,
  },
  borderBottom: {
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { fontSize: 18, color: Colors.cyan },
  itemLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { color: Colors.textSecondary, fontSize: 14 },
  arrowIcon: { color: Colors.textMuted, fontSize: 20 },
  segmentedContainer: { padding: 16 },
  segmentRow: {
     flexDirection: 'row',
     backgroundColor: 'rgba(10, 14, 20, 0.4)',
     borderRadius: 10,
     padding: 4,
     borderWidth: 1,
     borderColor: Colors.border,
     marginBottom: 12,
  },
  segment: {
     flex: 1,
     paddingVertical: 8,
     alignItems: 'center',
     justifyContent: 'center',
     borderRadius: 8,
  },
  segmentActive: {
     backgroundColor: '#1E4C5A',
     borderWidth: 1,
     borderColor: Colors.cyan,
  },
  segmentText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  segmentDesc: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic', paddingHorizontal: 4 },
  versionText: {
     textAlign: 'center',
     color: Colors.textMuted,
     fontSize: 12,
     marginTop: 10,
     letterSpacing: 0.5,
  },
});
