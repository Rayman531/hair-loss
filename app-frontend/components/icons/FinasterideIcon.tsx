import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Path, Circle, G, Defs, Filter } from 'react-native-svg';

interface FinasterideIconProps {
  size?: number;
}

export function FinasterideIcon({ size = 28 }: FinasterideIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        {/* Shadow */}
        <Ellipse cx={265} cy={360} rx={180} ry={40} fill="#000" opacity={0.1} />

        {/* Pill side */}
        <Path
          d="M70 240 A186 90 0 0 0 442 240 L442 300 A186 90 0 0 1 70 300 Z"
          fill="#9e636b"
          stroke="#4a2e32"
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Pill top */}
        <Ellipse cx={256} cy={240} rx={186} ry={90} fill="#d69ba4" stroke="#4a2e32" strokeWidth={5} />

        {/* Score line */}
        <G opacity={0.8}>
          <Path d="M85 275 L425 205" fill="none" stroke="#4a2e32" strokeWidth={8} strokeLinecap="round" />
          <Path d="M85 278 L425 208" fill="none" stroke="#f0c2c9" strokeWidth={2} strokeLinecap="round" />
        </G>

        {/* Highlight */}
        <Path
          d="M120 210 Q 180 170 280 185"
          fill="none"
          stroke="#fff"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.3}
        />
        <Circle cx={380} cy={240} r={5} fill="#fff" opacity={0.4} />
      </Svg>
    </View>
  );
}
