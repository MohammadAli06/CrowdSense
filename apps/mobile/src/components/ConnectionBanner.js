import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';
import { useCrowdContext } from '../context/CrowdContext';

/**
 * ConnectionBanner — shows a pulsing strip at the top of a screen
 * when the WebSocket is disconnected or still connecting.
 */
export default function ConnectionBanner() {
  const { status, wsUrl } = useCrowdContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const visible = status !== 'connected';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (status === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  if (!visible) return null;

  const isConnecting = status === 'connecting';
  const bgColor = isConnecting ? '#1A2A1A' : '#2A1212';
  const dotColor = isConnecting ? Colors.warning : Colors.critical;
  const label = isConnecting ? 'Connecting to backend…' : 'Disconnected — retrying…';

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bgColor, opacity: fadeAnim }]}>
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]} />
      <Text style={styles.text}>{label}</Text>
      <Text style={styles.url} numberOfLines={1}>{wsUrl}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,60,60,0.2)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  url: {
    color: Colors.textMuted,
    fontSize: 10,
    maxWidth: 140,
  },
});
