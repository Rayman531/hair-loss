import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ScalpMassagerIconProps {
  size?: number;
}

export function ScalpMassagerIcon({ size = 28 }: ScalpMassagerIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 400 500" fill="none">
        <Defs>
          <LinearGradient id="smHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#374151" />
            <Stop offset="50%" stopColor="#1F2937" />
            <Stop offset="100%" stopColor="#374151" />
          </LinearGradient>
          <LinearGradient id="smProng" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4B5563" />
            <Stop offset="50%" stopColor="#374151" />
            <Stop offset="100%" stopColor="#1F2937" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx={200} cy={475} rx={90} ry={18} fill="#000" opacity={0.1} />

        {/* Handle */}
        <Path
          d="M175 240 Q175 230 180 225 L185 200 Q190 180 200 180 Q210 180 215 200 L220 225 Q225 230 225 240 V430 Q225 455 200 455 Q175 455 175 430 Z"
          fill="url(#smHandle)"
          stroke="#111827"
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Handle highlight */}
        <Path
          d="M188 250 V410"
          stroke="#6B7280"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.4}
        />

        {/* Handle grip lines */}
        <Path d="M182 340 H218" stroke="#111827" strokeWidth={1.5} opacity={0.4} />
        <Path d="M182 355 H218" stroke="#111827" strokeWidth={1.5} opacity={0.4} />
        <Path d="M182 370 H218" stroke="#111827" strokeWidth={1.5} opacity={0.4} />

        {/* Head base - where prongs connect */}
        <Ellipse cx={200} cy={185} rx={55} ry={18} fill="url(#smHandle)" stroke="#111827" strokeWidth={2.5} />

        {/* Prongs - back row */}
        <G>
          {/* Back left */}
          <Path d="M155 180 Q148 140 140 100 Q138 88 145 82" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={145} cy={78} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={144} cy={76} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Back center-left */}
          <Path d="M175 178 Q170 130 168 90 Q167 78 172 72" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={172} cy={68} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={171} cy={66} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Back center */}
          <Path d="M200 175 Q200 125 200 85 Q200 73 200 67" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={200} cy={63} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={199} cy={61} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Back center-right */}
          <Path d="M225 178 Q230 130 232 90 Q233 78 228 72" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={228} cy={68} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={227} cy={66} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Back right */}
          <Path d="M245 180 Q252 140 260 100 Q262 88 255 82" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={255} cy={78} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={254} cy={76} r={3} fill="#FFFFFF" opacity={0.3} />
        </G>

        {/* Front prongs */}
        <G>
          {/* Front left */}
          <Path d="M162 190 Q152 155 145 120 Q143 108 148 103" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={148} cy={99} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={147} cy={97} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Front center */}
          <Path d="M200 192 Q200 155 200 118 Q200 106 200 100" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={200} cy={96} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={199} cy={94} r={3} fill="#FFFFFF" opacity={0.3} />

          {/* Front right */}
          <Path d="M238 190 Q248 155 255 120 Q257 108 252 103" stroke="url(#smProng)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={252} cy={99} r={9} fill="#374151" stroke="#1F2937" strokeWidth={2} />
          <Circle cx={251} cy={97} r={3} fill="#FFFFFF" opacity={0.3} />
        </G>
      </Svg>
    </View>
  );
}
