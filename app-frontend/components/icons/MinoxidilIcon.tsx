import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Path, Rect, Line, G } from 'react-native-svg';

interface MinoxidilIconProps {
  size?: number;
}

export function MinoxidilIcon({ size = 28 }: MinoxidilIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 400 500" fill="none">
        {/* Shadow */}
        <Ellipse cx={210} cy={465} rx={100} ry={30} fill="#4a4a4a" opacity={0.2} />

        <G transform="translate(10, 10)">
          {/* Bottle body */}
          <Path
            d="M120 220 Q120 190 160 190 H240 Q280 190 280 220 V430 Q280 470 200 470 Q120 470 120 430 Z"
            fill="#2a5298"
            stroke="#223344"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Bottom curve highlight */}
          <Path
            d="M135 420 Q150 450 200 450 Q250 450 265 420"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5}
            opacity={0.4}
          />

          {/* Label */}
          <Path d="M120 270 H280 V420 H120 Z" fill="#f4ead5" stroke="#223344" strokeWidth={2} />
          <Rect x={120} y={280} width={160} height={18} fill="#8cb4d9" opacity={0.7} />
          <Rect x={120} y={400} width={160} height={18} fill="#8cb4d9" opacity={0.7} />

          {/* Neck */}
          <Rect x={180} y={175} width={40} height={15} fill="#3a6ab0" stroke="#223344" strokeWidth={2} />

          {/* Dropper body */}
          <Rect x={150} y={130} width={100} height={45} rx={6} fill="#fcfcfc" stroke="#223344" strokeWidth={2.5} />
          <G stroke="#b0b0b0" strokeWidth={1.2}>
            <Line x1={160} y1={135} x2={160} y2={170} />
            <Line x1={173} y1={135} x2={173} y2={170} />
            <Line x1={186} y1={135} x2={186} y2={170} />
            <Line x1={200} y1={135} x2={200} y2={170} />
            <Line x1={213} y1={135} x2={213} y2={170} />
            <Line x1={226} y1={135} x2={226} y2={170} />
            <Line x1={240} y1={135} x2={240} y2={170} />
          </G>

          {/* Cap */}
          <Path
            d="M175 130 V100 Q175 75 200 75 Q225 75 225 100 V130 Z"
            fill="#fcfcfc"
            stroke="#223344"
            strokeWidth={2.5}
          />

          {/* Highlights */}
          <Path
            d="M140 210 Q140 200 155 200"
            fill="none"
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.6}
          />
          <Ellipse cx={190} cy={95} rx={8} ry={12} fill="#ffffff" opacity={0.3} rotation={-20} origin="190, 95" />
        </G>
      </Svg>
    </View>
  );
}
