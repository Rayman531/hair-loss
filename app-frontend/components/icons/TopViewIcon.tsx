import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, G } from 'react-native-svg';

interface TopViewIconProps {
  size?: number;
  color?: string;
}

export function TopViewIcon({ size = 64, color = '#1C1C1E' }: TopViewIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <G>
          {/* Head shape from above - slightly elongated */}
          <Ellipse cx={100} cy={108} rx={72} ry={82} stroke={color} strokeWidth={2.8} fill="none" />

          {/* Hairline border - short cropped hair edge */}
          <Path
            d="M32 95 C35 55 60 28 100 25 C140 28 165 55 168 95"
            stroke={color}
            strokeWidth={2.2}
            fill="none"
          />

          {/* Hair texture - short masculine cut, directional strokes */}
          {/* Crown whorl */}
          <Path d="M100 65 C96 72 94 80 95 88" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M100 65 C104 72 106 80 105 88" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />

          {/* Radiating from crown - left */}
          <Path d="M98 67 C90 62 80 58 68 56" stroke={color} strokeWidth={1.5} fill="none" opacity={0.6} />
          <Path d="M96 70 C86 68 74 66 60 68" stroke={color} strokeWidth={1.3} fill="none" opacity={0.5} />
          <Path d="M95 75 C84 75 72 76 58 80" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />

          {/* Radiating from crown - right */}
          <Path d="M102 67 C110 62 120 58 132 56" stroke={color} strokeWidth={1.5} fill="none" opacity={0.6} />
          <Path d="M104 70 C114 68 126 66 140 68" stroke={color} strokeWidth={1.3} fill="none" opacity={0.5} />
          <Path d="M105 75 C116 75 128 76 142 80" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />

          {/* Forward strokes */}
          <Path d="M100 65 C98 55 96 45 92 36" stroke={color} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M100 65 C102 55 104 45 108 36" stroke={color} strokeWidth={1.5} fill="none" opacity={0.5} />
          <Path d="M95 68 C90 55 84 42 76 34" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />
          <Path d="M105 68 C110 55 116 42 124 34" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />

          {/* Back strokes */}
          <Path d="M96 80 C88 90 80 100 72 108" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />
          <Path d="M104 80 C112 90 120 100 128 108" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />

          {/* Ears from top */}
          <Path
            d="M28 108 C24 104 24 112 28 114"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          <Path
            d="M172 108 C176 104 176 112 172 114"
            stroke={color}
            strokeWidth={2}
            fill="none"
          />

          {/* Crown area indicator - subtle dashed circle */}
          <Ellipse cx={100} cy={70} rx={16} ry={14} stroke={color} strokeWidth={1.5} fill="none" opacity={0.25} strokeDasharray="3 3" />

          {/* Forehead area at bottom of view */}
          <Path
            d="M60 165 C75 172 90 175 100 175 C110 175 125 172 140 165"
            stroke={color}
            strokeWidth={1.2}
            fill="none"
            opacity={0.3}
          />
        </G>
      </Svg>
    </View>
  );
}
