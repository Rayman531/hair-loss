import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Ellipse, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface RosemaryOilIconProps {
  size?: number;
}

export function RosemaryOilIcon({ size = 28 }: RosemaryOilIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 400 500" fill="none">
        <Defs>
          <LinearGradient id="rsoBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#166534" />
            <Stop offset="40%" stopColor="#15803D" />
            <Stop offset="70%" stopColor="#166534" />
            <Stop offset="100%" stopColor="#14532D" />
          </LinearGradient>
          <LinearGradient id="rsoDropper" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F5F5F5" />
            <Stop offset="100%" stopColor="#D4D4D4" />
          </LinearGradient>
          <LinearGradient id="rsoBulb" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#15803D" />
            <Stop offset="100%" stopColor="#166534" />
          </LinearGradient>
        </Defs>

        {/* Shadow */}
        <Ellipse cx={200} cy={470} rx={100} ry={22} fill="#000" opacity={0.1} />

        <G transform="translate(0, 5)">
          {/* Bottle body */}
          <Path
            d="M120 200 Q120 175 145 170 L255 170 Q280 175 280 200 V420 Q280 455 200 455 Q120 455 120 420 Z"
            fill="url(#rsoBody)"
            stroke="#0F4024"
            strokeWidth={3}
            strokeLinejoin="round"
          />

          {/* Bottom curve highlight */}
          <Path
            d="M140 435 Q170 450 200 450 Q230 450 260 435"
            fill="none"
            stroke="#22C55E"
            strokeWidth={2}
            opacity={0.35}
          />

          {/* Label area */}
          <Rect x={132} y={255} width={136} height={130} rx={6} fill="#F0FDF4" stroke="#0F4024" strokeWidth={2} opacity={0.95} />

          {/* Rosemary sprig on label */}
          {/* Main stem */}
          <Path
            d="M200 290 Q198 310 200 350"
            fill="none"
            stroke="#166534"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Left leaves */}
          <Path d="M200 300 Q185 293 180 298 Q183 305 200 305" fill="#22C55E" stroke="#166534" strokeWidth={1.2} />
          <Path d="M199 315 Q183 308 178 314 Q181 321 199 320" fill="#16A34A" stroke="#166534" strokeWidth={1.2} />
          <Path d="M199 330 Q185 324 181 330 Q184 336 199 334" fill="#22C55E" stroke="#166534" strokeWidth={1.2} />
          {/* Right leaves */}
          <Path d="M200 307 Q215 300 220 305 Q217 312 200 312" fill="#16A34A" stroke="#166534" strokeWidth={1.2} />
          <Path d="M200 322 Q216 315 221 321 Q218 328 200 326" fill="#22C55E" stroke="#166534" strokeWidth={1.2} />
          <Path d="M200 337 Q214 331 218 337 Q215 343 200 341" fill="#16A34A" stroke="#166534" strokeWidth={1.2} />

          {/* Neck */}
          <Rect x={175} y={130} width={50} height={42} fill="url(#rsoBody)" stroke="#0F4024" strokeWidth={3} />

          {/* Shoulder taper */}
          <Path d="M175 170 Q175 170 145 170" fill="none" stroke="#0F4024" strokeWidth={3} />
          <Path d="M225 170 Q225 170 255 170" fill="none" stroke="#0F4024" strokeWidth={3} />

          {/* Glass dropper tube */}
          <Rect x={185} y={90} width={30} height={45} rx={4} fill="url(#rsoDropper)" stroke="#A3A3A3" strokeWidth={2} />

          {/* Dropper graduation lines */}
          <Path d="M190 100 H210" stroke="#B0B0B0" strokeWidth={1} />
          <Path d="M190 110 H210" stroke="#B0B0B0" strokeWidth={1} />
          <Path d="M190 120 H210" stroke="#B0B0B0" strokeWidth={1} />

          {/* Rubber bulb */}
          <Ellipse cx={200} cy={70} rx={28} ry={25} fill="url(#rsoBulb)" stroke="#0F4024" strokeWidth={2.5} />

          {/* Bulb highlight */}
          <Path
            d="M185 60 Q190 52 200 52"
            fill="none"
            stroke="#4ADE80"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.4}
          />

          {/* Bottle highlight */}
          <Path
            d="M140 210 Q140 195 155 188"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.35}
          />

          {/* Side highlight */}
          <Path
            d="M145 220 V390"
            stroke="#22C55E"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.2}
          />
        </G>
      </Svg>
    </View>
  );
}
