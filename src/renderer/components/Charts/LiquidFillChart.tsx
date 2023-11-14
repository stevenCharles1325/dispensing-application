import { color } from 'd3-color';
import { interpolateRgb } from 'd3-interpolate';
import LiquidFillGauge from 'react-liquid-gauge';

const LiquidFillChart = (props): JSX.Element => {
  const startColor = '#9c27b0'; // cornflowerblue
  const endColor = '#dc143c'; // crimson

  const radius = 200;
  const interpolate = interpolateRgb(startColor, endColor);
  const fillColor = interpolate((props.value ?? 0) / 100);
  const gradientStops = [
      {
          key: '0%',
          stopColor: color(fillColor)?.darker(0.5).toString(),
          stopOpacity: 1,
          offset: '0%'
      },
      {
          key: '50%',
          stopColor: fillColor,
          stopOpacity: 0.75,
          offset: '50%'
      },
      {
          key: '100%',
          stopColor: color(fillColor)?.brighter(0.5).toString(),
          stopOpacity: 0.5,
          offset: '100%'
      }
  ];

  return (
    <LiquidFillGauge
      width={radius * (props.width ?? 2)}
      height={radius * (props.height ?? props.width ?? 2)}
      value={props.value}
      style={props.style}
      percent={props.percent ?? '%'}
      textSize={props.textSize ?? 1}
      textOffsetX={5}
      textOffsetY={30}
      textRenderer={(props: any) => {
        const value = Math.round(props.value);
        const radius = Math.min(props.height / 2, props.width / 2);
        const textPixels = (props.textSize * radius / 2);
        const valueStyle = {
            fontSize: textPixels
        };
        const percentStyle = {
            fontSize: textPixels * 0.6
        };

        return (
            <tspan>
              <tspan className="value" style={valueStyle}>{value}</tspan>
              <tspan style={percentStyle}>{props.percent}</tspan>
            </tspan>
        );
      }}
      riseAnimation
      waveAnimation
      waveFrequency={2}
      waveAmplitude={1}
      gradient
      gradientStops={gradientStops}
      circleStyle={{
          fill: fillColor
      }}
      waveStyle={{
          fill: fillColor
      }}
      textStyle={{
          fill: color('#444')?.toString(),
          fontFamily: 'Arial'
      }}
      waveTextStyle={{
          fill: color('#fff')?.toString(),
          fontFamily: 'Arial'
      }}
    />
  );
}

export default LiquidFillChart;
