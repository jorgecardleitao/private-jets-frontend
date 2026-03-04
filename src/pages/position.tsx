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
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import PublicIcon from "@mui/icons-material/Public";
import RadarIcon from "@mui/icons-material/Radar";

import { fetchPositions, Position } from "../data/position";
import { Aircraft, fetchAircrafts, interpolateMonth } from "../data/aircraft";
import SliderSelect from "../common/sliderSelect";
import MapWithScale from "../common/mapWithScale";

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

const PositionChart = ({ path, availableMonths }: { path?: string, availableMonths: string[] }) => {
  const current = new Date();
  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth();
  const months = new Map([...Array((currentYear - 2019) * 12 + currentMonth).keys()].map(v => [v, to_month(v)]));

  const [monthIndex, setMonthIndex] = useState<number>(months.size - 1);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [aircraftsLoading, setAircraftsLoading] = useState(false);
  const [aircraft, setAircraft] = useState<Aircraft | undefined>(undefined);
  const [positions, setPositions] = useState<Position[]>([]);

  const fetchAircraftsForMonth = () => {
    if (availableMonths.length === 0) return;
    const target = months.get(monthIndex)!;
    setAircraftsLoading(true);
    fetchAircrafts(interpolateMonth(target, availableMonths)).then(newAircrafts => {
      setAircrafts(newAircrafts);
      setAircraft(prev => {
        const next =
          newAircrafts.find(a => a.icao_number === prev?.icao_number)
          ?? newAircrafts.find(a => a.icao_number === "a6382d")
          ?? newAircrafts[0];
        return prev?.icao_number === next?.icao_number ? prev : next;
      });
      setAircraftsLoading(false);
    });
  };

  useEffect(() => {
    if (!aircraft) return;
    let cancelled = false;
    fetchPositions(aircraft.icao_number, months.get(monthIndex)).then(positions => {
      if (!cancelled) setPositions(positions);
    });
    return () => { cancelled = true; };
  }, [aircraft, monthIndex])

  const colorScale = scaleLinear()
    .domain(colors.keys())
    .range(colors.values())
    .clamp(true)

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 3 }}>
        <PublicIcon sx={{ fontSize: 36, color: 'error.main' }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            Geopositions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Flight paths of a specific aircraft in a given month, coloured by altitude (feet)
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RadarIcon sx={{ color: 'primary.main' }} />
          <AicraftSelector values={aircrafts} value={aircraft} onChange={setAircraft} onOpen={fetchAircraftsForMonth} loading={aircraftsLoading} label="Aircraft (tail number)" />
        </Box>
        <Box sx={{ px: 1 }}>
          <SliderSelect values={months} value={monthIndex} onChange={setMonthIndex} label="Month" marksEvery={6} />
        </Box>
      </Paper>

      {/* Map */}
      <Paper variant="outlined" sx={{ p: 1, overflow: 'hidden' }}>
        <MapWithScale height={385} colors={colors}>
          <ZoomableGroup>
            <Geographies geography={geoUrl} projectionConfig={{ scale: 1 }}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    id={geo.rsmKey}
                    fill="#2171b5"
                  />
                ))
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
      </Paper>
    </Container>
  );
};

export default PositionChart;

interface AicraftSelectorProps {
  values: Aircraft[]
  value: Aircraft
  onChange: (arg0: Aircraft) => void
  onOpen: () => void
  loading: boolean
  label: string
}

function AicraftSelector({ values, value, onChange, onOpen, loading, label }: AicraftSelectorProps) {
  return <Autocomplete
    disablePortal
    value={value}
    onChange={(_, v) => onChange(v)}
    onOpen={onOpen}
    loading={loading}
    options={values}
    sx={{ minWidth: 160, flex: 1 }}
    getOptionLabel={a => a.tail_number}
    renderInput={(params) => <TextField {...(params as any)} label={label} />}
  />
}
