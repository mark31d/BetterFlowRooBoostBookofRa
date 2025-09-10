// Components/Loader.js
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

/* Палитра под иконку */
const BR = {
  bg:   '#2B0B1E',         // глухой бордовый «небо за горами»
  text: '#FFEBD1',
  gold: '#F6C45A',         // заголовок/акценты (тёплое золото)
  gem:  '#38B5E6',         // сапфир для точек
};

/* Слои: небо/песок/терракота */
const LAYERS = {
  top:    '#4A0F1C', // тёмное небо/склоны
  middle: '#F0A23B', // золотой песок / свечение
  bottom: '#8D3A1B', // терракота/дюны
};

const TITAN = Platform.select({ ios: 'TitanOne', android: 'TitanOne-Regular' });
const LOGO = require('../assets/roo_timer.webp');

/* строим полосу между волнами (или над/под волной) */
function makeBandPath(w, h, opts) {
  const {
    topY, bottomY,
    ampTop = 0, ampBottom = 0,
    phaseTop = 0, phaseBottom = 0,
    mode = 'between', samples = 24,
  } = opts;

  const xs = Array.from({ length: samples }, (_, i) => (w * i) / (samples - 1));
  const yTop = topY == null ? null : xs.map(x => topY + ampTop * Math.sin((x / w) * Math.PI * 2 + phaseTop));
  const yBot = bottomY == null ? null : xs.map(x => bottomY + ampBottom * Math.sin((x / w) * Math.PI * 2 + phaseBottom));

  if (mode === 'between' && yTop && yBot) {
    let d = `M 0 ${yTop[0]}`;
    xs.forEach((x, i) => { d += ` L ${x} ${yTop[i]}`; });
    d += ` L ${w} ${yBot[samples - 1]}`;
    for (let i = samples - 2; i >= 0; i--) d += ` L ${xs[i]} ${yBot[i]}`;
    d += ' Z';
    return d;
  }
  if (mode === 'above' && yBot) {
    let d = `M 0 0 L ${w} 0 L ${w} ${yBot[samples - 1]}`;
    for (let i = samples - 2; i >= 0; i--) d += ` L ${xs[i]} ${yBot[i]}`;
    d += ' Z';
    return d;
  }
  if (mode === 'below' && yTop) {
    let d = `M 0 ${h} L ${w} ${h} L ${w} ${yTop[samples - 1]}`;
    for (let i = samples - 2; i >= 0; i--) d += ` L ${xs[i]} ${yTop[i]}`;
    d += ' Z';
    return d;
  }
  return '';
}

export default function Loader({
  delay = 1400,
  onFinish,
  showLogo = true,
  showTitle = true,
  message,
}) {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(width, height), [width, height]);

  useEffect(() => {
    if (!onFinish) return;
    const t = setTimeout(onFinish, delay);
    return () => clearTimeout(t);
  }, [onFinish, delay]);

  // пульс логотипа
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const logoAnimStyle = {
    transform: [
      { scale:      pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
      { translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
    ],
  };

  // «танцующие» точки
  const dots = [useRef(new Animated.Value(0)).current,
                useRef(new Animated.Value(0)).current,
                useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((v, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 420, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
          Animated.delay(140),
        ])
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dotStyle = (v) => ({
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
      { scale:     v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
    ],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
  });

  // геометрия слоёв
  const y1 = height * 0.32;
  const y2 = height * 0.64;
  const pathTopFill    = makeBandPath(width, height, { bottomY: y1, ampBottom: 12, phaseBottom: 0.4, mode: 'above' });
  const pathMiddleBand = makeBandPath(width, height, { topY: y1, bottomY: y2, ampTop: 12, ampBottom: 16, phaseTop: 0.4, phaseBottom: 1.4, mode: 'between' });
  const pathBottomFill = makeBandPath(width, height, { topY: y2, ampTop: 16, phaseTop: 1.4, mode: 'below' });

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* фон-слои */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={pathTopFill}    fill={LAYERS.top} />
        <Path d={pathMiddleBand} fill={LAYERS.middle} />
        <Path d={pathBottomFill} fill={LAYERS.bottom} />
      </Svg>

      {/* контент */}
      <View style={styles.center}>
        {showLogo && (
          <Animated.View style={[styles.logoBox, logoAnimStyle]}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        )}

        {showTitle && (
          <>
            <Text style={styles.title}>BOOST ROO:</Text>
            <Text style={styles.title}>BETTER FLOW</Text>
          </>
        )}

        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>

      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, dotStyle(dots[0])]} />
        <Animated.View style={[styles.dot, dotStyle(dots[1])]} />
        <Animated.View style={[styles.dot, dotStyle(dots[2])]} />
      </View>
    </View>
  );
}

function makeStyles(w, h) {
  const min = Math.min(w, h);
  const icon = Math.round(min * 0.34);
  const padTop = Math.round(h * 0.14);

  return StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: BR.bg,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 28,
    },
    center: { marginTop: padTop, alignItems: 'center' },
    logoBox: { width: icon, height: icon, marginBottom: Math.max(16, Math.round(min * 0.03)) },
    logo: { width: '100%', height: '100%' },

    title: {
      color: BR.gold,
      fontFamily: TITAN,
      fontSize: Math.round(min * 0.07),
      letterSpacing: 0.6,
      textAlign: 'center',
      lineHeight: Math.round(min * 0.082),
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    message: {
      marginTop: 10,
      color: 'rgba(255,235,209,0.9)', // светлая подпись в тон иконке
      fontSize: Math.round(min * 0.04),
      textAlign: 'center',
    },

    dotsRow: { width: 86, height: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', columnGap: 18 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#4B2E2A', // сапфировые точки
    },
  });
}
