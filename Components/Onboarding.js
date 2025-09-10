// Components/Onboarding.js
import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const BR = {
  bg: '#180A12',
  text: '#FFFFFF',
  gold1: '#FFB400',
  gold2: '#FF6A00',
  dotDim: 'rgba(255,180,0,0.35)',
  skipBg: 'rgba(255,180,0,0.18)',
  skipBd: 'rgba(255,180,0,0.45)',
  fade1: 'rgba(24,10,18,0)',
  fade2: 'rgba(24,10,18,0.55)',
};

const TITAN = Platform.select({ ios: 'TitanOne', android: 'TitanOne-Regular' });

const SLIDES = [
  {
    key: 'build',
    title: 'BUILD YOUR RHYTHM',
    desc:
      'PLAN QUICK WORKOUTS, START THE TIMER, AND STACK STREAKS. YOUR CALENDAR KEEPS YOU HONEST, ONE HOP AT A TIME',
    img: require('../assets/onb1.webp'),
  },
  {
    key: 'flow',
    title: 'MEET THE FLOW METER',
    desc:
      'A SIMPLE WEEKLY SCORE POWERED BY YOU: CONSISTENCY, TIME GOAL, AND A BALANCED MIX OF EASY–MODERATE–HARD. NO QUIZZES, JUST MOVEMENT',
    img: require('../assets/onb2.webp'),
  },
  {
    key: 'grow',
    title: 'GROW WITH ROO',
    desc:
      'MOTIVATIONAL READS, PHOTO COMPARISONS, AND QUICK CHECK-INS',
    img: require('../assets/onb3.webp'),
  },
];

export default function Onboarding({ navigation }) {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goTabs = useCallback(async () => {
    try { await AsyncStorage.setItem('br:seenOnboarding', '1'); } catch {}
    navigation.replace('Tabs');
  }, [navigation]);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      goTabs();
    }
  };

  const onScroll = ({ nativeEvent }) => {
    const x = nativeEvent.contentOffset.x || 0;
    const i = Math.round(x / W);
    if (i !== index) setIndex(i);
  };

  const styles = useMemo(() => makeStyles(insets), [insets]);

  return (
    <View style={styles.wrap}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <Pressable onPress={goTabs} style={styles.skip}>
        <Text style={styles.skipTxt}>Skip</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(it) => it.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.img} style={styles.hero} resizeMode="cover" />
            <LinearGradient
              colors={[BR.fade1, BR.fade2, BR.bg]}
              locations={[0, 0.45, 1]}
              style={styles.fade}
            />
            <View style={styles.bottom}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
              <Pressable onPress={next} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}>
                <LinearGradient
                  colors={[BR.gold1, BR.gold2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaBg}
                >
                  <Text style={styles.ctaTxt}>
                    {index === SLIDES.length - 1 ? 'Begin' : 'Next'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function makeStyles(insets) {
  const padB = Math.max(12, insets.bottom);
  const bottomHeight = Math.round(H * 0.28);

  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: BR.bg },
    slide: { width: W, height: H, alignItems: 'center', justifyContent: 'flex-end' },
    hero: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: W, height: H },
    fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: bottomHeight + 120 },
    bottom: {
      width: W,
      height: bottomHeight,
      paddingHorizontal: 24,
      paddingBottom: padB + 14,
      justifyContent: 'flex-end',
      gap: 12,
    },
    title: {
      color: BR.gold1,
      fontFamily: TITAN,
      fontSize: 26,
      letterSpacing: 0.6,
      textShadowColor: 'rgba(0,0,0,0.35)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    desc: { color: BR.text, opacity: 0.92, fontSize: 14, lineHeight: 20 },
    cta: { marginTop: 12 },
    ctaBg: {
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(242,181,66,0.65)',
      shadowColor: '#E06A1C',
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    ctaTxt: { color: '#fff', fontSize: 18, fontWeight: '600' },
    skip: {
      position: 'absolute',
      top: Math.max(12, insets.top + 6),
      left: 16,
      zIndex: 10,
      paddingHorizontal: 14,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BR.skipBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: BR.skipBd,
    },
    skipTxt: { color: '#FFD37A', fontSize: 15, fontWeight: '700' },
    dots: {
      position: 'absolute',
      bottom: padB + 72,
      width: W,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BR.dotDim },
    dotActive: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: BR.gold1,
      shadowColor: '#FFB400',
      shadowOpacity: 0.55,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
      elevation: 2,
    },
  });
}
