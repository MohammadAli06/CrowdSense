import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';

import MapScreen from '../screens/MapScreen';
import RouteScreen from '../screens/RouteScreen';
import AlertsScreen from '../screens/AlertsScreen';
import TrendsScreen from '../screens/TrendsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ZoneDetailScreen from '../screens/ZoneDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// SVG-inspired custom tab icons as React Native views
const IconMap = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Hexagon-like map pin */}
    <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: 4, borderWidth: 1.5, borderColor: color }} />
    <View style={{ position: 'absolute', bottom: 1, width: 1.5, height: size * 0.35, backgroundColor: color }} />
  </View>
);

const IconRoute = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Winding route shape */}
    <View style={{ width: size * 0.5, height: size * 0.5, borderTopRightRadius: size * 0.25, borderBottomRightRadius: size * 0.25, borderWidth: 1.5, borderColor: color, borderLeftWidth: 0 }} />
    <View style={{ position: 'absolute', left: size * 0.05, top: size * 0.15, width: 1.5, height: size * 0.3, backgroundColor: color }} />
    <View style={{ position: 'absolute', right: size * 0.05, bottom: size * 0.15, width: 1.5, height: size * 0.3, backgroundColor: color }} />
  </View>
);

const IconAlerts = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Bell */}
    <View style={{ width: size * 0.6, height: size * 0.55, borderTopLeftRadius: size * 0.3, borderTopRightRadius: size * 0.3, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0 }} />
    <View style={{ width: size * 0.7, height: 1.5, backgroundColor: color, marginTop: -1 }} />
    <View style={{ width: size * 0.22, height: size * 0.22, borderBottomLeftRadius: size * 0.11, borderBottomRightRadius: size * 0.11, borderWidth: 1.5, borderTopWidth: 0, borderColor: color }} />
  </View>
);

const IconTrends = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* trending line up */}
    <View style={{ position: 'absolute', bottom: size * 0.25, left: size * 0.08, width: size * 0.84, height: 1.5, backgroundColor: color, opacity: 0.3 }} />
    {/* Line segments going up */}
    <View style={{ position: 'absolute', bottom: size * 0.2, left: size * 0.05, width: size * 0.27, height: 1.5, backgroundColor: color, transform: [{ rotate: '-30deg' }] }} />
    <View style={{ position: 'absolute', bottom: size * 0.3, left: size * 0.27, width: size * 0.27, height: 1.5, backgroundColor: color, transform: [{ rotate: '30deg' }] }} />
    <View style={{ position: 'absolute', bottom: size * 0.2, left: size * 0.5, width: size * 0.4, height: 1.5, backgroundColor: color, transform: [{ rotate: '-40deg' }] }} />
  </View>
);

const IconSettings = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: size * 0.21, borderWidth: 1.5, borderColor: color }} />
    {/* Gear teeth - left/right/top/bottom */}
    {[0, 45, 90, 135].map((angle, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          width: size * 0.15,
          height: size * 0.2,
          borderRadius: 2,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    ))}
    <View style={{ position: 'absolute', width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: Colors.bgSecondary }} />
  </View>
);

const ICON_COMPONENTS = {
  Map: IconMap,
  Route: IconRoute,
  Alerts: IconAlerts,
  Trends: IconTrends,
  Settings: IconSettings,
};

function TabIcon({ focused, name, label }) {
  const color = focused ? Colors.cyan : Colors.textMuted;
  const IconComponent = ICON_COMPONENTS[name];

  return (
    <View style={tabStyles.tabItem}>
      {/* Active glow indicator at top */}
      {focused && <View style={tabStyles.activeIndicator} />}

      <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
        <IconComponent color={color} size={19} />
      </View>

      <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Map" label="MAP" />
          ),
        }}
      />
      <Tab.Screen
        name="Route"
        component={RouteScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Route" label="ROUTE" />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Alerts" label="ALERTS" />
          ),
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Trends" label="TRENDS" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Settings" label="SETTINGS" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen
        name="ZoneDetail"
        component={ZoneDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0C1219',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 74,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    // Top separator line with glow
    borderTopColor: 'rgba(0, 212, 232, 0.08)',
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    flex: 1,
    position: 'relative',
    minWidth: 56,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(0, 212, 232, 0.1)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: Colors.cyan,
  },
});
