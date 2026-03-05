import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface FrontViewIconProps {
  size?: number;
  color?: string;
}

export function FrontViewIcon({ size = 64, color = '#1C1C1E' }: FrontViewIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 220" fill="none">
        <G>
          {/* Head shape - strong angular jaw */}
          <Path
            d="M100 18 C65 18 40 48 38 82 C36 100 37 115 42 128 L46 142 L50 155 C52 160 54 164 58 168 L68 178 L78 185 C85 188 92 192 100 194 C108 192 115 188 122 185 L132 178 L142 168 C146 164 148 160 150 155 L154 142 L158 128 C163 115 164 100 162 82 C160 48 135 18 100 18Z"
            stroke={color}
            strokeWidth={2.8}
            fill="none"
          />

          {/* Hairline - mature M shape */}
          <Path
            d="M42 78 C44 62 50 48 60 38 C66 32 74 27 84 24 C90 22 95 21 100 21 C105 21 110 22 116 24 C126 27 134 32 140 38 C150 48 156 62 158 78"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          {/* Hair volume on top */}
          <Path
            d="M48 72 C50 52 62 35 82 26 C90 23 95 22 100 22 C105 22 110 23 118 26 C138 35 150 52 152 72"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            opacity={0.4}
          />
          {/* Subtle temple recession */}
          <Path d="M55 70 C52 60 55 50 62 42" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />
          <Path d="M145 70 C148 60 145 50 138 42" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />

          {/* Left eyebrow - thick, angular */}
          <Path
            d="M62 88 C66 82 76 80 88 84"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          {/* Right eyebrow */}
          <Path
            d="M112 84 C124 80 134 82 138 88"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />

          {/* Left eye - narrow, angular */}
          <Path
            d="M66 96 C70 91 80 90 88 93 C84 98 74 99 66 96Z"
            stroke={color}
            strokeWidth={1.8}
            fill="none"
          />
          {/* Left iris */}
          <Path d="M77 94 C79 93 80 94 80 96 C79 97 77 97 77 94Z" fill={color} />

          {/* Right eye */}
          <Path
            d="M112 93 C120 90 130 91 134 96 C126 99 116 98 112 93Z"
            stroke={color}
            strokeWidth={1.8}
            fill="none"
          />
          {/* Right iris */}
          <Path d="M120 94 C122 93 123 94 123 96 C122 97 120 97 120 94Z" fill={color} />

          {/* Nose - defined bridge, angular tip */}
          <Path
            d="M100 90 L100 120"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
          <Path
            d="M92 126 C94 122 97 120 100 120 C103 120 106 122 108 126"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          {/* Nostrils */}
          <Path d="M92 126 C94 128 96 128 98 126" stroke={color} strokeWidth={1.2} fill="none" opacity={0.5} />
          <Path d="M102 126 C104 128 106 128 108 126" stroke={color} strokeWidth={1.2} fill="none" opacity={0.5} />

          {/* Mouth - firm, straight */}
          <Path
            d="M84 144 C90 141 96 140 100 140 C104 140 110 141 116 144"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          {/* Lower lip hint */}
          <Path
            d="M88 146 C94 150 106 150 112 146"
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.4}
          />

          {/* Jaw definition lines */}
          <Path d="M46 142 L58 168" stroke={color} strokeWidth={1.5} fill="none" opacity={0.4} />
          <Path d="M154 142 L142 168" stroke={color} strokeWidth={1.5} fill="none" opacity={0.4} />
          <Path d="M58 168 L68 178 L78 185" stroke={color} strokeWidth={1.5} fill="none" opacity={0.35} />
          <Path d="M142 168 L132 178 L122 185" stroke={color} strokeWidth={1.5} fill="none" opacity={0.35} />

          {/* Chin cleft hint */}
          <Path d="M98 168 C99 172 101 172 102 168" stroke={color} strokeWidth={1} fill="none" opacity={0.3} />

          {/* Ears */}
          <Path
            d="M38 88 C32 88 28 96 29 106 C30 114 34 118 38 118"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          <Path
            d="M162 88 C168 88 172 96 171 106 C170 114 166 118 162 118"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />

          {/* Neck - thick */}
          <Path d="M72 192 L68 220" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M128 192 L132 220" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* Adam's apple hint */}
          <Path d="M98 205 L100 210 L102 205" stroke={color} strokeWidth={1} fill="none" opacity={0.3} />
        </G>
      </Svg>
    </View>
  );
}
