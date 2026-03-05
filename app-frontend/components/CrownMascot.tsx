import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

export type CrownState = 'neutral' | 'encouraging' | 'completion';

interface CrownMascotProps {
  state?: CrownState;
  size?: number;
}

const COLORS = {
  fill: '#FFFCE6',
  stroke: '#8C8679',
  green: '#566246',
  greenSoft: '#6B7A5A',
  badge: '#566246',
  badgeBorder: '#F8F8F8',
  checkmark: '#FFFFFF',
};

/**
 * Crown mascot based on logo2.svg with three emotional states.
 *
 *  - neutral:      default linework, composed expression
 *  - encouraging:  green-tinted stroke, slightly wider smile
 *  - completion:   green stroke, wide smile, checkmark badge
 */
export function CrownMascot({ state = 'neutral', size = 120 }: CrownMascotProps) {
  const isEncouraging = state === 'encouraging';
  const isCompletion = state === 'completion';

  // Stroke color shifts with state
  const strokeColor = isCompletion
    ? COLORS.green
    : isEncouraging
      ? COLORS.greenSoft
      : COLORS.stroke;

  // Mouth expression varies by state (logo2.svg coordinates in 500x500 viewBox)
  const mouthPath = isCompletion
    ? 'M200 295C220 325 280 325 300 295'  // wide smile
    : isEncouraging
      ? 'M210 295C228 318 272 318 290 295' // gentle smile
      : 'M220 295C235 315 265 315 280 295'; // composed (original)

  // Eye expression — arcs curve more in encouraging/completion
  const leftEye = isCompletion
    ? 'M140 245C162 275 215 275 237 245'
    : isEncouraging
      ? 'M145 245C166 272 212 272 233 245'
      : 'M150 245C170 270 210 270 230 245';

  const rightEye = isCompletion
    ? 'M268 245C290 275 340 275 362 245'
    : isEncouraging
      ? 'M272 245C292 272 338 272 358 245'
      : 'M275 245C295 270 335 270 355 245';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 500 500" fill="none">
        {/* Crown body — from logo2.svg */}
        <Path
          d="M250 50 C280 50 310 140 335 175 C340 180 390 155 440 145 C460 140 465 160 455 180 C440 210 425 350 415 385 C390 440 110 440 85 385 C75 350 60 210 45 180 C35 160 40 140 60 145 C110 155 160 180 165 175 C190 140 220 50 250 50Z"
          fill={COLORS.fill}
          stroke={strokeColor}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Eyes */}
        <Path
          d={leftEye}
          stroke={strokeColor}
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={rightEye}
          stroke={strokeColor}
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />

        {/* Mouth */}
        <Path
          d={mouthPath}
          stroke={strokeColor}
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />

        {/* Completion badge */}
        {isCompletion && (
          <G>
            <Circle
              cx={420}
              cy={385}
              r={50}
              fill={COLORS.badge}
              stroke={COLORS.badgeBorder}
              strokeWidth={10}
            />
            <Path
              d="M395 385L412 402L445 370"
              fill="none"
              stroke={COLORS.checkmark}
              strokeWidth={9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        )}

        {/* Encouraging sparkles */}
        {isEncouraging && (
          <G>
            <Path
              d="M50 120L60 100L70 120"
              stroke={COLORS.greenSoft}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M430 120L440 100L450 120"
              stroke={COLORS.greenSoft}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
