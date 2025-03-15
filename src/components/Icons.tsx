import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { NONE } from '../util/constants';

type IconProps = {
    color1: string;
};

export const SearchIcon = ({ color1 }: IconProps) => (
    <View>
        <Svg
            style={{
                opacity: 0.9,
                aspectRatio: 1,
            }}
            viewBox="-1 -1 31.71 31.71"
        >
            <Path fill={NONE} strokeWidth={2} stroke={color1} d="M30.21,30.21l-9.47-9.47" />
            <Circle fill={NONE} strokeWidth={2} stroke={color1} cx="12.85" cy="12.85" r="11.35" />
            <Path
                fill={NONE}
                strokeWidth={1}
                stroke={color1}
                d="M12.85,20.21c-4.05,0-7.35-3.3-7.35-7.35s3.3-7.35,7.35-7.35,7.35,3.3,7.35,7.35-3.3,7.35-7.35,7.35Z"
            />
        </Svg>
    </View>
);

type BoxIconProps = {
    color1?: string;
    color2?: string;
};
export const BoxIcon = ({ color1, color2 }: BoxIconProps) => (
    <View>
        <Svg
            style={{
                opacity: 0.9,
                aspectRatio: 1,
            }}
            viewBox="-3 -3 73.32 73.32"
        >
            <Rect
                fill={color2 ?? NONE}
                stroke={color1 ?? NONE}
                strokeWidth={3.8}
                x="7.21"
                y="43.18"
                width="24.14"
                height="24.14"
                rx="6.09"
                ry="6.09"
            />
            <Rect
                fill={color2 ?? NONE}
                stroke={color1 ?? NONE}
                strokeWidth={3.8}
                x="7.21"
                y="14.43"
                width="24.14"
                height="24.14"
                rx="6.09"
                ry="6.09"
            />
            <Rect
                fill={color2 ?? NONE}
                stroke={color1 ?? NONE}
                strokeWidth={3.8}
                x="35.96"
                y="14.43"
                width="24.14"
                height="52.89"
                rx="6.09"
                ry="6.09"
            />
            <Path
                fill={color2 ?? NONE}
                stroke={color1 ?? NONE}
                strokeWidth={3.8}
                d="M58.86,0H8.46C3.79,0,0,3.79,0,8.46v4.25s0,.04,0,.06c.02,2.09,2.82,2.79,3.94,1.02,1.52-2.39,4.19-3.98,7.23-3.98h16.22c1.88,0,3.61.61,5.02,1.63.74.54,1.74.54,2.48,0,1.41-1.03,3.15-1.63,5.02-1.63h16.23c3.04,0,5.71,1.59,7.23,3.98,1.12,1.76,3.92,1.07,3.94-1.02,0-.02,0-.04,0-.06v-4.25c0-4.67-3.79-8.46-8.46-8.46Z"
            />
        </Svg>
    </View>
);

export const ApertureIcon = ({ color1 }: IconProps) => (
    <Svg style={{}} viewBox="-2 -2 101 101">
        <Circle stroke={color1} strokeWidth={3} fill={NONE} cx="48.5" cy="48.5" r="47.5" />
        <Polygon
            fill={color1}
            points="48.5 29.01 33.26 36.35 29.5 52.84 40.04 66.06 56.96 66.06 67.5 52.84 63.74 36.35 48.5 29.01"
        />
        <Line stroke={color1} strokeWidth={3} x1="34.77" y1="93.88" x2="67.5" y2="52.84" />
        <Line stroke={color1} strokeWidth={3} x1="4.35" y1="66.06" x2="56.96" y2="66.06" />
        <Line stroke={color1} strokeWidth={3} x1="7.25" y1="24.94" x2="40.04" y2="66.06" />
        <Line stroke={color1} strokeWidth={3} x1="41.2" y1="1.56" x2="29.5" y2="52.84" />
        <Line stroke={color1} strokeWidth={3} x1="80.64" y1="13.53" x2="33.26" y2="36.35" />
        <Line stroke={color1} strokeWidth={3} x1="95.88" y1="51.83" x2="48.5" y2="29.01" />
        <Line stroke={color1} strokeWidth={3} x1="75.44" y1="87.62" x2="63.74" y2="36.35" />
    </Svg>
);

export const CrossIcon = ({ color1 }: IconProps) => (
    <View>
        <Svg
            style={{
                aspectRatio: 1,
            }}
            viewBox="0 0 12.57 12.57"
        >
            <Path
                fill={color1}
                d="M8.06,6.28l4.14-4.14c.49-.49.49-1.29,0-1.78-.49-.49-1.29-.49-1.78,0l-4.14,4.14L2.15.37C1.65-.12.86-.12.37.37-.12.86-.12,1.65.37,2.15l4.14,4.14L.37,10.42c-.49.49-.49,1.29,0,1.78.25.25.57.37.89.37s.64-.12.89-.37l4.14-4.14,4.14,4.14c.25.25.57.37.89.37s.64-.12.89-.37c.49-.49.49-1.29,0-1.78l-4.14-4.14Z"
            />
        </Svg>
    </View>
);

export const SaveIcon = ({ color1 }: IconProps) => (
    <View>
        <Svg
            style={{
                aspectRatio: 1,
                opacity: 0.9,
            }}
            strokeWidth={0.9}
            viewBox="0 0 24 24"
        >
            <Path
                stroke={color1}
                fill="none"
                d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"
            />
            <Path stroke={color1} fill="none" d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <Path stroke={color1} fill="none" d="M14 4l0 4l-6 0l0 -4" />
        </Svg>
    </View>
);

export const CloseDownIcon = ({ color1 }: IconProps) => (
    <View>
        <Svg
            style={{
                aspectRatio: 1,
                opacity: 0.9,
            }}
            strokeWidth={2}
            strokeLinecap="round"
            viewBox="0 0 24 16"
        >
            <Path stroke={color1} fill="none" d="M4 11l8 3l8 -3" />
        </Svg>
    </View>
);

export const BackIcon = ({ color1 }: IconProps) => (
    <Svg style={{}} strokeWidth="3" viewBox="3.5 3.5 18 18">
        <Path stroke={color1} strokeLinecap="round" fill="none" d="M9 14l-4 -4l4 -4" />
        <Path stroke={color1} strokeLinecap="round" fill="none" d="M5 10h11a4 4 0 1 1 0 8h-1" />
    </Svg>
);
