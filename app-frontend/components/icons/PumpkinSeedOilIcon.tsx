import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Ellipse, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface PumpkinSeedOilIconProps {
  size?: number;
}

export function PumpkinSeedOilIcon({ size = 28 }: PumpkinSeedOilIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 400 500" fill="none">
        <Defs>
          <LinearGradient id="psoBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="40%" stopColor="#F59E0B" />
            <Stop offset="70%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#B45309" />
          </LinearGradient>
          <LinearGradient id="psoDropper" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F5F5F5" />
            <Stop offset="100%" stopColor="#D4D4D4" />
          </LinearGradient>
          <LinearGradient id="psoBulb" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx={200} cy={470} rx={100} ry={22} fill="#000" opacity={0.1} />

        <G transform="translate(0, 5)">
          {/* Bottle body - amber/dark glass */}
          <Path
            d="M120 200 Q120 175 145 170 L255 170 Q280 175 280 200 V420 Q280 455 200 455 Q120 455 120 420 Z"
            fill="url(#psoBody)"
            stroke="#92400E"
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Bottom curve highlight */}
          <Path
            d="M140 435 Q170 450 200 450 Q230 450 260 435"
            fill="none"
            stroke="#FBBF24"
            strokeWidth={2}
            opacity={0.4}
          />

          {/* Label area - cream rectangle */}
          <Rect x={132} y={260} width={136} height={120} rx={6} fill="#FFFBEB" stroke="#92400E" strokeWidth={2} opacity={0.95} />

          {/* Orange drop on label */}
          <Path
            d="M200 285 Q200 285 188 310 Q180 325 188 338 Q194 348 200 348 Q206 348 212 338 Q220 325 212 310 Z"
            fill="#F97316"
            stroke="#EA580C"
            strokeWidth={2}
          />
          {/* Drop highlight */}
          <Circle cx={195} cy={320} r={4} fill="#FFFFFF" opacity={0.5} />

          {/* Neck */}
          <Rect x={175} y={130} width={50} height={42} fill="url(#psoBody)" stroke="#92400E" strokeWidth={3} />

          {/* Shoulder taper */}
          <Path d="M175 170 Q175 170 145 170" fill="none" stroke="#92400E" strokeWidth={3} />
          <Path d="M225 170 Q225 170 255 170" fill="none" stroke="#92400E" strokeWidth={3} />

          {/* Glass dropper tube */}
          <Rect x={185} y={90} width={30} height={45} rx={4} fill="url(#psoDropper)" stroke="#A3A3A3" strokeWidth={2} />

          {/* Dropper graduation lines */}
          <Path d="M190 100 H210" stroke="#B0B0B0" strokeWidth={1} />
          <Path d="M190 110 H210" stroke="#B0B0B0" strokeWidth={1} />
          <Path d="M190 120 H210" stroke="#B0B0B0" strokeWidth={1} />

          {/* Rubber bulb */}
          <Ellipse cx={200} cy={70} rx={28} ry={25} fill="url(#psoBulb)" stroke="#92400E" strokeWidth={2.5} />

          {/* Bulb highlight */}
          <Path
            d="M185 60 Q190 52 200 52"
            fill="none"
            stroke="#FBBF24"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.5}
          />

          {/* Bottle highlight */}
          <Path
            d="M140 210 Q140 195 155 188"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.4}
          />

          {/* Side highlight */}
          <Path
            d="M145 220 V390"
            stroke="#FBBF24"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.25}
          />
        </G>
      </Svg>
    </View>
  );
}
