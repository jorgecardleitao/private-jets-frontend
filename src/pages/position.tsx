import { useEffect, useState } from "preact/hooks";

import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
} from "react-simple-maps";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { fetchPositions, Position } from "../data/position";
import { Aircraft } from "../data/aircraft";
import SliderSelect from "../common/sliderSelect";

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

const to_month = (a: number): string => {
  const year = Math.floor(a / 12);
  const month = a % 12;
  return `${2019 + year}-${String(1 + month).padStart(2, "0")}`
}

const PositionChart = ({ aircrafts }: { aircrafts: Aircraft[] }) => {
  const current = new Date();
  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth();
  const months = new Map([...Array((currentYear - 2019 - 1) * 12 + currentMonth + 1).keys()].map(v => [v, to_month(v)]));

  const aircraftsMap = new Map(aircrafts.slice(0, 100).map(a => [a.icao_number, a]))

  const [month, setMonth] = useState<number>(months[-1]);
  const [aircraft, setAircraft] = useState<Aircraft>(aircraftsMap.get("a6382d"));
  const [positions, setPositions] = useState<Position[]>([]);



  useEffect(() => {
    fetchPositions(aircraft.icao_number, months.get(month)).then(setPositions)
  }, [aircraft, month])

  return <>
    <AicraftSelector values={aircraftsMap} value={aircraft} onChange={setAircraft} label="Aircraft" />
    <SliderSelect values={months} value={month} onChange={setMonth} label="Month" marksEvery={6} />
    <ComposableMap height={500}>
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
          strokeWidth={0.5}
          strokeLinecap="round" />
      )))}
    </ComposableMap >
  </>;
};

export default PositionChart;

interface AicraftSelectorProps {
  values: Map<string, Aircraft>
  value: Aircraft
  onChange: (arg0: any) => void
  label: string
}

function AicraftSelector({ values, value, onChange, label }: AicraftSelectorProps) {
  return <FormControl sx={{ m: 1, minWidth: 80 }}>
    <InputLabel id={`${label}-label`}>{label}</InputLabel>
    <Select
      labelId={`${label}-label`}
      id={label}
      value={value.icao_number}
      onChange={e => onChange(values.get((e.target as HTMLTextAreaElement).value))}
      autoWidth
      label="Option"
    >
      {
        Array.from(Iterator.map(values.entries(), ([k, a]) => {
          return <MenuItem value={k}>{a.tail_number}</MenuItem>
        }))
      }
    </Select>
  </FormControl>
}
