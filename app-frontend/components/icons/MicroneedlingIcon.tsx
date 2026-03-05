import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Circle, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MicroneedlingIconProps {
  size?: number;
}

export function MicroneedlingIcon({ size = 28 }: MicroneedlingIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="50 20 700 700" fill="none">
        <Defs>
          <LinearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E5E7EB" />
            <Stop offset="25%" stopColor="#D1D5DB" />
            <Stop offset="50%" stopColor="#F3F4F6" />
            <Stop offset="75%" stopColor="#9CA3AF" />
            <Stop offset="100%" stopColor="#D1D5DB" />
          </LinearGradient>
          <LinearGradient id="darkParts" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#374151" />
            <Stop offset="50%" stopColor="#1F2937" />
            <Stop offset="100%" stopColor="#374151" />
          </LinearGradient>
          <LinearGradient id="deepBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="50%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1E40AF" />
          </LinearGradient>
          <LinearGradient id="silverRing" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F3F4F6" />
            <Stop offset="50%" stopColor="#D1D5DB" />
            <Stop offset="100%" stopColor="#F3F4F6" />
          </LinearGradient>
          <LinearGradient id="cartridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#DBEAFE" />
            <Stop offset="50%" stopColor="#A7C9F3" />
            <Stop offset="100%" stopColor="#93C5FD" />
          </LinearGradient>
        </Defs>

        <G transform="translate(10, 0) rotate(-35, 400, 400)">
          {/* Main body */}
          <Path
            d="M350 300 C 350 280, 650 280, 650 300 L 650 400 C 650 420, 350 420, 350 400 Z"
            fill="url(#metalBody)"
            stroke="#374151"
            strokeWidth={4}
          />
          {/* End cap */}
          <Path
            d="M650 300 C 680 300, 700 320, 700 350 C 700 380, 680 400, 650 400"
            fill="url(#darkParts)"
            stroke="#374151"
            strokeWidth={4}
          />

          {/* Body highlight */}
          <Path d="M360 315 Q 500 305 640 315" stroke="white" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
          {/* Cap highlight */}
          <Path
            d="M660 310 C 675 310, 685 325, 685 350 C 685 375, 675 390, 660 390"
            stroke="white"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.4}
            fill="none"
          />

          {/* Buttons */}
          <Rect x={520} y={325} width={80} height={50} rx={25} fill="#1F2937" fillOpacity={0.9} />
          <Circle cx={545} cy={350} r={14} fill="url(#deepBlue)" stroke="#111827" strokeWidth={2.5} />
          <Circle cx={575} cy={350} r={14} fill="url(#deepBlue)" stroke="#111827" strokeWidth={2.5} />

          {/* Blue connector */}
          <Path
            d="M320 300 C 320 285, 350 285, 350 300 L 350 400 C 350 415, 320 415, 320 400 Z"
            fill="url(#deepBlue)"
            stroke="#1E3A8A"
            strokeWidth={3}
          />

          {/* Dark section */}
          <Path
            d="M220 315 L 320 300 L 320 400 L 220 385 Z"
            fill="url(#darkParts)"
            stroke="#111827"
            strokeWidth={4}
          />

          {/* Silver ring */}
          <Rect x={180} y={320} width={40} height={60} rx={4} fill="url(#silverRing)" stroke="#1F2937" strokeWidth={3} />
          <Line x1={190} y1={320} x2={190} y2={380} stroke="#6B7280" strokeWidth={2.5} />
          <Line x1={200} y1={320} x2={200} y2={380} stroke="#6B7280" strokeWidth={2.5} />
          <Line x1={210} y1={320} x2={210} y2={380} stroke="#6B7280" strokeWidth={2.5} />

          {/* Cartridge */}
          <Path
            d="M80 330 L 180 325 L 180 375 L 80 370 Z"
            fill="#93C5FD"
            fillOpacity={0.8}
            stroke="#2563EB"
            strokeWidth={3}
          />

          {/* Needle lines */}
          <G opacity={0.6}>
            <Path d="M100 340 L 160 340" stroke="#111827" strokeWidth={1} />
            <Path d="M100 345 L 160 345" stroke="#1E3A8A" strokeWidth={2.5} />
            <Path d="M100 348 L 160 348" stroke="#1E3A8A" strokeWidth={2.5} />
            <Path d="M100 353 L 160 353" stroke="#111827" strokeWidth={1} />
          </G>

          {/* Cartridge highlights */}
          <Path d="M110 338 Q 140 342 165 338" stroke="white" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        </G>
      </Svg>
    </View>
  );
}
