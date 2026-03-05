import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface KetoconazoleIconProps {
  size?: number;
}

export function KetoconazoleIcon({ size = 28 }: KetoconazoleIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 400 500" fill="none">
        <Defs>
          <LinearGradient id="ketoBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#2563EB" />
            <Stop offset="40%" stopColor="#3B82F6" />
            <Stop offset="70%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="ketoCap" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="50%" stopColor="#F0F0F0" />
            <Stop offset="100%" stopColor="#E0E0E0" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx={200} cy={465} rx={110} ry={25} fill="#000" opacity={0.1} />

        <G transform="translate(0, 5)">
          {/* Bottle body */}
          <Path
            d="M100 180 Q100 160 120 155 L280 155 Q300 160 300 180 V420 Q300 450 200 450 Q100 450 100 420 Z"
            fill="url(#ketoBody)"
            stroke="#1E40AF"
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Bottom curve highlight */}
          <Path
            d="M120 430 Q160 448 200 448 Q240 448 280 430"
            fill="none"
            stroke="#60A5FA"
            strokeWidth={2}
            opacity={0.5}
          />

          {/* Label area - white rectangle */}
          <Rect x={115} y={240} width={170} height={130} rx={8} fill="#FFFFFF" stroke="#1E40AF" strokeWidth={2} opacity={0.95} />

          {/* Label accent stripes */}
          <Rect x={115} y={248} width={170} height={12} fill="#93C5FD" opacity={0.5} />
          <Rect x={115} y={358} width={170} height={12} fill="#93C5FD" opacity={0.5} />

          {/* Shoulder taper */}
          <Path
            d="M160 115 Q160 155 120 155"
            fill="none"
            stroke="#1E40AF"
            strokeWidth={3}
          />
          <Path
            d="M240 115 Q240 155 280 155"
            fill="none"
            stroke="#1E40AF"
            strokeWidth={3}
          />
          <Rect x={155} y={112} width={90} height={43} fill="url(#ketoBody)" stroke="#1E40AF" strokeWidth={3} />

          {/* Flip-top cap */}
          <Rect x={150} y={65} width={100} height={50} rx={10} fill="url(#ketoCap)" stroke="#B0B0B0" strokeWidth={2.5} />

          {/* Cap hinge line */}
          <Path d="M155 90 H245" stroke="#CCCCCC" strokeWidth={1.5} />

          {/* Cap top nozzle */}
          <Rect x={180} y={55} width={40} height={14} rx={7} fill="#F5F5F5" stroke="#B0B0B0" strokeWidth={2} />

          {/* Bottle highlight */}
          <Path
            d="M125 190 Q125 175 140 170"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Side highlight */}
          <Path
            d="M130 200 V380"
            stroke="#60A5FA"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.3}
          />
        </G>
      </Svg>
    </View>
  );
}
