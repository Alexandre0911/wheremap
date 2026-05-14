import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = [
  '#FF0000', '#FF6B00', '#FFC800', '#8CFF00',
  '#00FF6B', '#00E5FF', '#0088FF', '#6B00FF',
  '#C800FF', '#FF00B8', '#FF0055',
];

function buildPalette() {
  const palette = [];
  for (const base of COLORS) {
    palette.push(base);
    const r = parseInt(base.slice(1, 3), 16);
    const g = parseInt(base.slice(3, 5), 16);
    const b = parseInt(base.slice(5, 7), 16);
    const mix = (c) => Math.round(c * 0.4 + 0x99 * 0.6);
    palette.push(`#${mix(r).toString(16).padStart(2,'0')}${mix(g).toString(16).padStart(2,'0')}${mix(b).toString(16).padStart(2,'0')}`);
  }
  palette.push('#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000');
  return palette;
}

const PALETTE = buildPalette();

export default function ColorPicker({ selectedColor, onSelect }) {
  const [hexInput, setHexInput] = useState(selectedColor);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('palette');

  const handleHex = () => {
    const cleaned = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
    if (/^#[a-f\d]{6}$/i.test(cleaned)) {
      setHexInput(cleaned); setError(false); onSelect(cleaned);
    } else {
      setError(true);
    }
  };

  return (
    <View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'palette' && styles.tabActive]} onPress={() => setTab('palette')}>
          <Text style={[styles.tabText, tab === 'palette' && styles.tabTextActive]}>Palette</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'hex' && styles.tabActive]} onPress={() => setTab('hex')}>
          <Text style={[styles.tabText, tab === 'hex' && styles.tabTextActive]}>Hex</Text>
        </TouchableOpacity>
      </View>

      {tab === 'palette' ? (
        <View style={styles.grid}>
          {PALETTE.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.swatch, { backgroundColor: color }, selectedColor === color && styles.selected]}
              onPress={() => { setHexInput(color); onSelect(color); }}
            />
          ))}
        </View>
      ) : (
        <View>
          <View style={styles.previewRow}>
            <View style={[styles.preview, { backgroundColor: selectedColor }]} />
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={hexInput}
              onChangeText={(t) => { setHexInput(t); setError(false); }}
              onEndEditing={handleHex}
              onSubmitEditing={handleHex}
              autoCapitalize="none"
              maxLength={7}
              placeholder="#FF6B6B"
              placeholderTextColor="#555"
            />
          </View>
          {error && <Text style={styles.errorText}>Invalid hex (e.g. #FF6B6B)</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', marginBottom: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#0f3460' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#16213e' },
  tabActive: { backgroundColor: '#0f3460' },
  tabText: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  swatch: { width: 28, height: 28, borderRadius: 6 },
  selected: { borderWidth: 2, borderColor: '#fff', transform: [{ scale: 1.1 }] },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preview: { width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderColor: '#0f3460' },
  input: { flex: 1, backgroundColor: '#16213e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#fff', textAlign: 'center', fontWeight: '700', letterSpacing: 2, borderWidth: 1, borderColor: '#0f3460' },
  inputError: { borderColor: '#E94560' },
  errorText: { color: '#E94560', fontSize: 11, marginTop: 4 },
});