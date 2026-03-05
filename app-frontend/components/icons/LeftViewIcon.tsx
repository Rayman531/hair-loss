import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface LeftViewIconProps {
  size?: number;
  color?: string;
}

export function LeftViewIcon({ size = 64, color = '#1C1C1E' }: LeftViewIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 220" fill="none">
        {/* Mirror of right view */}
        <G transform="translate(200, 0) scale(-1, 1)">
          {/* Cranium - back of head */}
          <Path
            d="M85 22 C55 25 38 50 35 80 C33 100 35 118 40 135 C43 145 47 155 52 163 C56 170 60 178 65 185 L68 190 L68 220"
            stroke={color}
            strokeWidth={2.8}
            fill="none"
            strokeLinecap="round"
          />

          {/* Forehead to chin - front profile */}
          <Path
            d="M85 22 C100 20 115 22 128 30 C140 40 148 55 152 72 C155 85 154 96 150 108 L148 115 C150 120 155 130 157 136 C158 140 156 146 150 150 L145 152 C142 158 138 166 132 174 C126 180 118 186 108 190 L105 192 L105 220"
            stroke={color}
            strokeWidth={2.8}
            fill="none"
            strokeLinecap="round"
          />

          {/* Hairline */}
          <Path
            d="M85 22 C95 21 108 22 118 28 C130 36 140 50 148 70"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          {/* Short hair texture */}
          <Path d="M80 24 C68 28 55 40 45 60" stroke={color} strokeWidth={1.5} fill="none" opacity={0.35} />
          <Path d="M82 23 C72 26 60 36 50 55" stroke={color} strokeWidth={1.2} fill="none" opacity={0.25} />
          <Path d="M90 22 C100 22 112 26 125 36" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />

          {/* Brow ridge */}
          <Path
            d="M140 78 C142 76 148 76 152 80"
            stroke={color}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M136 82 C140 80 148 80 152 82" stroke={color} strokeWidth={1} fill="none" opacity={0.3} />

          {/* Eye */}
          <Path
            d="M138 90 C142 86 150 86 154 90 C150 93 142 93 138 90Z"
            stroke={color}
            strokeWidth={1.8}
            fill="none"
          />
          <Path d="M146 89 C147 88 148 89 148 90 C147 91 146 91 146 89Z" fill={color} />

          {/* Nose */}
          <Path
            d="M150 108 L158 128 C159 132 157 136 153 138 L148 139"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path d="M150 108 L152 100" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />

          {/* Mouth */}
          <Path
            d="M135 152 C140 149 146 150 150 152"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M136 154 C141 157 147 156 150 153"
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.4}
          />

          {/* Chin - strong, square */}
          <Path
            d="M145 152 L148 162 L145 170 L138 176 L128 182 L120 186"
            stroke={color}
            strokeWidth={1.8}
            fill="none"
            opacity={0.45}
          />

          {/* Jaw angle - sharp defined line */}
          <Path
            d="M52 163 L62 172 L75 180 L90 186 L108 190"
            stroke={color}
            strokeWidth={1.8}
            fill="none"
            opacity={0.4}
          />
          {/* Jaw corner accent */}
          <Path d="M50 160 L58 168" stroke={color} strokeWidth={1.5} fill="none" opacity={0.35} />

          {/* Ear */}
          <Path
            d="M95 80 C88 78 82 84 80 94 C78 104 80 112 86 118 C82 112 80 104 82 95 C84 88 88 82 95 80Z"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          <Path d="M90 85 C86 90 84 98 86 108" stroke={color} strokeWidth={1} fill="none" opacity={0.35} />

          {/* Neck */}
          <Path d="M68 190 L68 220" stroke={color} strokeWidth={2.8} strokeLinecap="round" fill="none" />
          <Path d="M105 192 L105 220" stroke={color} strokeWidth={2.8} strokeLinecap="round" fill="none" />
          <Path d="M75 195 C80 200 88 208 95 215" stroke={color} strokeWidth={1} fill="none" opacity={0.25} />
        </G>
      </Svg>
    </View>
  );
}
