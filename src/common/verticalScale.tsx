import useTheme from "@mui/material/styles/useTheme"
import { format } from "../pages/aggregates"

const Iterator =
{
  map: (it, f) => function* () {
    for (const x of it)
      yield f(x)
  }()
}

const style = `
text {
  font-size: 3px;
}

@media (max-width: 600px) {
  text {
    font-size: 3px;
  }
}

@media (max-width: 800px) {
  text {
    font-size: 4px;
  }
}
`

export default function VerticalScale({ colors, height }: { colors: Map<number, string>, height: number }) {
  const theme = useTheme();

  const min = Math.min(...colors.keys())
  const max = Math.max(...colors.keys())
  const scale = (v: number) => min + (max - min) * v

  const margin = 5
  const rectWidth = 3
  const width = rectWidth + 12

  return <svg viewBox={`0 0 ${width} ${height}`}>
    <style>{style}</style>
    <defs>
      <linearGradient id="gradient" x1="0" x2="0" y1="1" y2="0">
        {[...Iterator.map(colors.entries(), ([key, value]: [number, string]) => <stop offset={`${(key - min) / (max - min) * 100}%`} stop-color={value} />)]}
      </linearGradient>
    </defs>
    <rect
      x={0}
      y={margin}
      width={rectWidth}
      height={height - 2 * margin}
      style={{ fill: "url(#gradient)" }}
    >
    </rect>
    {[...Iterator.map(colors.keys(), (key: number) => <text
      x={1 + rectWidth}
      y={margin + (height - 2 * margin) - (height - 2 * margin) * (key - min) / (max - min)}
      stroke="none"
      dominant-baseline="central"
      fill={theme.palette.text.primary}>{format(scale((key - min) / (max - min)), 0)}
    </text>
    )
    ]}
  </svg>
}
