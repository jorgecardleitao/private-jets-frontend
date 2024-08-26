import { useEffect, useState } from "preact/hooks";

import { scaleLinear } from "d3-scale";

import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  ZoomableGroup,
} from "react-simple-maps";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import useTheme from "@mui/material/styles/useTheme";
import Grid from "@mui/material/Grid";

import { fetchPositions, Position } from "../data/position";
import { Aircraft } from "../data/aircraft";
import SliderSelect from "../common/sliderSelect";
import { format } from "./aggregates";
import Box from "@mui/material/Box";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

function* window<T>(inputArray: T[], size: number): Generator<T[]> {
  for (let index = 0; index + size <= inputArray.length; index++) {
    yield inputArray.slice(index, index + size);
  }
}

const Iterator =
{
  map: (it, f) => function* () {
    for (const x of it)
      yield f(x)
  }()
}

const colors = new Map([
  [0, "#f54242"],
  [1000, "#ef751b"],
  [2000, "#f09522"],
  [3000, "#e9b416"],
  [4000, "#e5b716"],
  [6000, "#c3c312"],
  [8000, "#4ac414"],
  [10000, "#21c031"],
  [20000, "#16b3b9"],
  [30000, "#403fee"],
  [40000, "#cb16cd"],
])

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

const Scale = ({ fill, height }: { fill: string, height: number }) => {
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
      fill={fill}>{format(scale((key - min) / (max - min)))}
    </text>
    )
    ]}
  </svg>
}

const to_month = (a: number): string => {
  const year = Math.floor(a / 12);
  const month = a % 12;
  return `${2019 + year}-${String(1 + month).padStart(2, "0")}`
}

const PositionChart = ({ aircrafts }: { aircrafts: Aircraft[] }) => {
  const theme = useTheme();

  const current = new Date();
  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth();
  const months = new Map([...Array((currentYear - 2019) * 12 + currentMonth).keys()].map(v => [v, to_month(v)]));

  const [month, setMonth] = useState<number>(months[-1]);
  const [aircraft, setAircraft] = useState<Aircraft>(aircrafts.find(v => v.icao_number == "a6382d"));
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    fetchPositions(aircraft.icao_number, months.get(month)).then(setPositions)
  }, [aircraft, month])

  const colorScale = scaleLinear()
    .domain(colors.keys())
    .range(colors.values());

  return <>
    <AicraftSelector values={aircrafts} value={aircraft} onChange={setAircraft} label="Aircraft" />
    <SliderSelect values={months} value={month} onChange={setMonth} label="Month" marksEvery={6} />
    <Grid container spacing={1}>
      <Grid item xs={11}>
        <ComposableMap height={385 * 11 / 12 * 800 / 600}>
          <ZoomableGroup>
            <Geographies geography={geoUrl} projectionConfig={{ scale: 1 }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  return <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    id={geo.rsmKey}
                    fill="#2171b5"
                  />
                })
              }
            </Geographies>
            {Array.from(Iterator.map(window(positions.filter((_, index) => index % 10 == 0), 2), ([from, to]: [Position, Position]) => (
              <Line
                from={[from.longitude, from.latitude]}
                to={[to.longitude, to.latitude]}
                strokeWidth={0.3}
                stroke={to.altitude ? colorScale(to.altitude) : "#767b74"}
                strokeLinecap="round" />
            )))}
          </ZoomableGroup>
        </ComposableMap >
      </Grid>
      <Grid item xs={1}>
        <Scale fill={theme.palette.text.primary} height={920 * 1 / 12 * 800 / 600} />
      </Grid>
    </Grid >
  </>;
};

export default PositionChart;

interface AicraftSelectorProps {
  values: Aircraft[]
  value: Aircraft
  onChange: (arg0: Aircraft) => void
  label: string
}

function AicraftSelector({ values, value, onChange, label }: AicraftSelectorProps) {
  return <Autocomplete
    disablePortal
    value={value}
    onChange={(_, v) => onChange(v)}
    options={values}
    sx={{ width: 300 }}
    getOptionLabel={a => a.tail_number}
    renderInput={(params) => <TextField {...params} label={label} />}
  />
}
