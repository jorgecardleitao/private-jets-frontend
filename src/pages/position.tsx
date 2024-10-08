import { useEffect, useState } from "preact/hooks";

import { scaleLinear } from "d3-scale";

import {
  Geographies,
  Geography,
  Line,
  ZoomableGroup,
} from "react-simple-maps";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { fetchPositions, Position } from "../data/position";
import { Aircraft } from "../data/aircraft";
import SliderSelect from "../common/sliderSelect";
import MapWithScale from "../common/mapWithScale";
import Typography from "@mui/material/Typography/Typography";

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

const to_month = (a: number): string => {
  const year = Math.floor(a / 12);
  const month = a % 12;
  return `${2019 + year}-${String(1 + month).padStart(2, "0")}`
}

const PositionChart = ({ aircrafts }: { aircrafts: Aircraft[] }) => {
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
    .range(colors.values())
    .clamp(true)

  return <>
    <Typography align="center" variant="h5">
      Flights of a specific private aircraft at a given month and corresponding altitude (feet)
    </Typography>
    <AicraftSelector values={aircrafts} value={aircraft} onChange={setAircraft} label="Aircraft" />
    <SliderSelect values={months} value={month} onChange={setMonth} label="Month" marksEvery={6} />
    <MapWithScale height={385} colors={colors}>
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
    </MapWithScale>
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
