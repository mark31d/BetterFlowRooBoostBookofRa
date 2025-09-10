// Components/GalleryScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  Modal,
  Dimensions,
  Share,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width: W } = Dimensions.get('window');

/* Пустынная палитра */
const BR = {
  bg:    '#180A12',
  card:  '#2B1A27',
  text:  '#FFFFFF',
  sub:   'rgba(255,255,255,0.78)',
  line:  'rgba(255,255,255,0.16)',
  gold1: '#FFB400',
  gold2: '#FF6A00',
  chip:  '#4B2E2A',
  border:'rgba(255,255,255,0.06)',
};

const GALLERY_KEY = 'br:gallery';

const fmtDate = (iso) => {
  const d = new Date(iso);
  const day = d.toLocaleString(undefined, { day: '2-digit' });
  const mon = d.toLocaleString(undefined, { month: 'short' });
  const yr  = d.getFullYear();
  return `${day} ${mon} ${yr}`;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function GalleryScreen() {
  const [tab, setTab] = useState('all'); // 'all' | 'compare'
  const [items, setItems] = useState([]); // [{id, uri, createdAt}]
  const [picker, setPicker] = useState({ visible: false, target: null, mode: 'all' }); // target = index | 'left' | 'right'
  const [compare, setCompare] = useState({ leftId: null, rightId: null });

  // load
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(GALLERY_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        setItems(arr);
        if (arr.length) {
          setCompare({
            leftId:  arr[0]?.id ?? null,
            rightId: arr[1]?.id ?? arr[0]?.id ?? null,
          });
        }
      } catch {}
    })();
  }, []);

  const save = async (next) => {
    setItems(next);
    try { await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(next)); } catch {}
  };

  // ---- add from library (optional) ----
  const addFromLibrary = async () => {
    try {
      const {launchImageLibrary} = require('react-native-image-picker');
      const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 4 });
      if (res?.assets?.length) {
        const toAdd = res.assets.map(a => ({
          id: uid(),
          uri: a.uri,
          createdAt: new Date().toISOString(),
        }));
        const next = [...toAdd, ...items];
        await save(next);
        if (!compare.leftId) setCompare({ leftId: next[0].id, rightId: next[1]?.id ?? next[0].id });
      }
    } catch {}
  };

  // ---- delete ----
  const onDelete = (id) => {
    Alert.alert(
      'Delete this photo?',
      "This will remove the photo from your Gallery. This action can’t be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const next = items.filter(x => x.id !== id);
            await save(next);
            setCompare((prev) => ({
              leftId:  prev.leftId  === id ? next[0]?.id ?? null : prev.leftId,
              rightId: prev.rightId === id ? next[1]?.id ?? next[0]?.id ?? null : prev.rightId,
            }));
          },
        },
      ]
    );
  };

  // ---- picker from existing list ----
  const openReplaceInAll = (index) => setPicker({ visible: true, target: index, mode: 'all' });
  const openReplaceLeft  = () => setPicker({ visible: true, target: 'left',  mode: 'compare' });
  const openReplaceRight = () => setPicker({ visible: true, target: 'right', mode: 'compare' });

  const onPickExisting = async (chosenId) => {
    if (picker.mode === 'all' && typeof picker.target === 'number') {
      const targetIdx = picker.target;
      const chosenIdx = items.findIndex(x => x.id === chosenId);
      if (chosenIdx < 0 || targetIdx < 0 || targetIdx >= items.length) {
        setPicker({ visible: false, target: null, mode: 'all' });
        return;
      }
      const next = [...items];
      const tmp = next[targetIdx];
      next[targetIdx] = next[chosenIdx];
      next[chosenIdx] = tmp;
      await save(next);
    } else if (picker.mode === 'compare') {
      setCompare((prev) => ({
        leftId:  picker.target === 'left'  ? chosenId : prev.leftId,
        rightId: picker.target === 'right' ? chosenId : prev.rightId,
      }));
    }
    setPicker({ visible: false, target: null, mode: 'all' });
  };

  const leftItem  = useMemo(() => items.find(x => x.id === compare.leftId)  || null, [items, compare.leftId]);
  const rightItem = useMemo(() => items.find(x => x.id === compare.rightId) || null, [items, compare.rightId]);

  // ---- UI ----
  return (
    <View style={styles.wrap}>
      {/* Header */}
      <Text style={styles.h1}>GALLERY</Text>

      {/* Segmented */}
      <View style={styles.segRow}>
        <SegButton active={tab==='all'}    label="All"     onPress={() => setTab('all')} />
        <SegButton active={tab==='compare'} label="Compare" onPress={() => setTab('compare')} />
      </View>

      {tab === 'all' ? (
        <AllGrid
          items={items}
          onAdd={addFromLibrary}
          onReplace={openReplaceInAll}
          onDelete={onDelete}
        />
      ) : (
        <CompareView
          left={leftItem}
          right={rightItem}
          onPickLeft={openReplaceLeft}
          onPickRight={openReplaceRight}
          onShare={async () => {
            try {
              const lbl = leftItem && rightItem
                ? `${fmtDate(leftItem.createdAt)} - ${fmtDate(rightItem.createdAt)}`
                : 'Progress photos';
              await Share.share({ message: `Boost Roo — ${lbl}` });
            } catch {}
          }}
        />
      )}

      {/* Picker from existing */}
      <ChooseFromExisting
        visible={picker.visible}
        items={items}
        disabledId={picker.mode==='all' && typeof picker.target==='number'
          ? items[picker.target]?.id : null}
        onClose={() => setPicker({ visible: false, target: null, mode: 'all' })}
        onPick={onPickExisting}
      />
    </View>
  );
}

// ---------- sub components ----------
function SegButton({ active, label, onPress }) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <LinearGradient colors={[BR.gold1, BR.gold2]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.segActive}>
          <Text style={styles.segTxtActive}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.seg, { flex: 1 }]}>
      <Text style={styles.segTxt}>{label}</Text>
    </Pressable>
  );
}

function AllGrid({ items, onAdd, onReplace, onDelete }) {
  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Image source={require('../assets/roo.webp')} style={{ width: 220, height: 220 }} resizeMode="contain" />
        <Text style={styles.emptyTxt}>CAPTURE YOUR JOURNEY, NOT JUST THE FINISH</Text>
        <Fab onPress={onAdd} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 6, gap: 14 }}
        renderItem={({ item, index }) => (
          <View style={styles.tile}>
            <Pressable onPress={() => onReplace(index)} onLongPress={() => onDelete(item.id)} style={{ flex: 1 }}>
              <Image source={{ uri: item.uri }} style={styles.img} />
            </Pressable>
            <View style={styles.caption}>
              <Text style={styles.captionTxt}>{fmtDate(item.createdAt)}</Text>
            </View>
          </View>
        )}
      />
      <Fab onPress={onAdd} />
    </View>
  );
}

function CompareView({ left, right, onPickLeft, onPickRight, onShare }) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 8 }}>
        <Pressable onPress={onPickLeft} style={[styles.compareBox, left && { borderColor: BR.gold1 }]}>
          {left ? <Image source={{ uri: left.uri }} style={styles.compareImg} /> : <Placeholder />}
        </Pressable>
        <Pressable onPress={onPickRight} style={[styles.compareBox, right && { borderColor: BR.gold1 }]}>
          {right ? <Image source={{ uri: right.uri }} style={styles.compareImg} /> : <Placeholder />}
        </Pressable>

        <View style={styles.rangeBox}>
          <Text style={styles.rangeTxt}>
            {left && right ? `${fmtDate(left.createdAt)} - ${fmtDate(right.createdAt)}` : 'Pick two photos'}
          </Text>
        </View>

        <Pressable onPress={onShare} style={styles.shareBtn}>
          <Text style={styles.shareTxt}>Share </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Placeholder() {
  return (
    <View style={styles.ph}>
      <Text style={{ color: BR.sub }}>Tap to choose photo</Text>
    </View>
  );
}

function Fab({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.fabWrap}>
      <LinearGradient colors={[BR.gold1, BR.gold2]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fab}>
        <Text style={{ color: '#fff', fontSize: 26, lineHeight: 26, marginTop: -2 }}>＋</Text>
      </LinearGradient>
    </Pressable>
  );
}

function ChooseFromExisting({ visible, items, disabledId, onClose, onPick }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>Select a photo</Text>
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            numColumns={3}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const disabled = item.id === disabledId;
              return (
                <Pressable
                  disabled={disabled}
                  onPress={() => onPick(item.id)}
                  style={[styles.pickCell, disabled && { opacity: 0.35 }]}
                >
                  <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- styles ----------
const TILE_W = (W - 16*2 - 14) / 2;
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BR.bg },
  h1: { color: BR.text, fontSize: 28, fontWeight: '800', paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },

  segRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  seg: {
    height: 48,
    borderRadius: 18,
    backgroundColor: BR.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segActive: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  segTxt: { color: BR.text, opacity: 0.9, fontSize: 16, fontWeight: '700' },
  segTxtActive: { color: '#fff', fontSize: 16, fontWeight: '800' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTxt: { color: BR.text, textAlign: 'center', marginTop: 14, opacity: 0.9 },

  tile: {
    width: TILE_W,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: BR.card,
    borderWidth: 1,
    borderColor: BR.border,
  },
  img: { width: TILE_W, height: TILE_W * 1.1, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  caption: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderTopColor: BR.border,
  },
  captionTxt: { color: BR.text, fontSize: 15 },

  fabWrap: { position: 'absolute', right: 18, bottom: 110 },
  fab: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  compareBox: {
    height: TILE_W * 1.35,
    borderRadius: 18,
    backgroundColor: BR.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  compareImg: { width: '100%', height: '100%' },

  rangeBox: {
    height: 52,
    borderRadius: 16,
    backgroundColor: BR.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BR.border,
  },
  rangeTxt: { color: BR.text, fontSize: 16 },

  shareBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTxt: { color: '#fff', fontSize: 18 },

  ph: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // modal picker
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '70%',
    width: '100%',
    backgroundColor: BR.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  sheetTitle: { color: BR.text, fontSize: 16, fontWeight: '700', marginBottom: 10, paddingHorizontal: 4 },
  pickCell: { width: (W - 8*4) / 3, height: (W - 8*4) / 3, borderRadius: 10, overflow: 'hidden' },
});
