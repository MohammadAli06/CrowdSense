import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.5)).current;
  const ring2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 1000, useNativeDriver: true,
    }).start();

    // Pulse icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Ring pulses
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0.5, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0.3, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Radar background arcs */}
      <View style={styles.radarContainer}>
        <Animated.View style={[styles.radarArc, styles.arcOuter, { opacity: ring2 }]} />
        <Animated.View style={[styles.radarArc, styles.arcMiddle, { opacity: ring1 }]} />
        <View style={styles.arcInner} />
        {/* Horizontal lines */}
        <View style={styles.radarLineH} />
        <View style={styles.radarLineV} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Signal icon */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#00D4E8', '#00B4C8']}
            style={styles.iconCircle}
          >
            {/* signal ripple waves */}
            <View style={styles.signalGroup}>
              <Text style={styles.signalText}>((·))</Text>
            </View>
          </LinearGradient>
          <View style={styles.iconRing} />
        </Animated.View>

        <Text style={styles.title}>CROWDSENSE</Text>
        <Text style={styles.subtitle}>Real-time crowd safety</Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#00D4E8', '#00B8CC']}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>View Live Map</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>V2.4.0  •  SECURED DATA STREAM</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarContainer: {
    position: 'absolute',
    top: height * 0.05,
    width: width * 1.1,
    height: width * 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarArc: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 999,
    borderColor: Colors.cyan,
  },
  arcOuter: {
    width: width * 0.95,
    height: width * 0.95,
    borderColor: 'rgba(0,212,232,0.12)',
  },
  arcMiddle: {
    width: width * 0.68,
    height: width * 0.68,
    borderColor: 'rgba(0,212,232,0.18)',
  },
  arcInner: {
    position: 'absolute',
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,212,232,0.25)',
  },
  radarLineH: {
    position: 'absolute',
    width: width * 0.95,
    height: 1,
    backgroundColor: 'rgba(0,212,232,0.06)',
  },
  radarLineV: {
    position: 'absolute',
    width: 1,
    height: width * 0.95,
    backgroundColor: 'rgba(0,212,232,0.06)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    width: '100%',
    marginTop: height * 0.1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  iconRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,232,0.4)',
  },
  signalText: {
    color: Colors.bg,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -1,
  },
  signalGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    letterSpacing: 0.5,
    marginBottom: height * 0.25,
  },
  btn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  btnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.bg,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
  },
});
