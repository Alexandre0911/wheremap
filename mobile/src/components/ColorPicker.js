import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = [
  '#FF6B6B', '#E94560', '#FF9F43', '#FECA57',
  '#48DBFB', '#0ABDE3', '#1DD1A1', '#10AC84',
  '#5F27CD', '#341F97', '#FF9FF3', '#F368E0',
];

export default function ColorPicker({ selectedColor, onSelect }) {
  return (
    <View style={styles.grid}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.swatch,
            { backgroundColor: color },
            selectedColor === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
        />
      ))}
    </View>
  );
}

const SWATCH_SIZE = 36;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.15 }],
  },
});
