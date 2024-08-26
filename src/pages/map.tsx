import { useEffect, useState } from "preact/hooks";

import { scaleLinear } from "d3-scale";

import {
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { CountryAggregate, fetchAggregates, quantities } from "../data/timeseries";
import { MouseTracker } from "../tooltip";
import { format } from "./aggregates";
import SliderSelect from "../common/sliderSelect";
import { Box } from "@mui/material";
import MapWithScale from "../common/mapWithScale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const colors = new Map([
  [0, "#08306b"],
  [10_000_000, "#08519c"],
  [20_000_000, "#2171b5"],
  [30_000_000, "#4292c6"],
  [40_000_000, "#6baed6"],
  [50_000_000, "#9ecae1"],
  [60_000_000, "#c6dbef"],
  [70_000_000, "#deebf7"],
  [80_000_000, "#fee0d2"],
  [90_000_000, "#fcbba1"],
  [100_000_000, "#fc9272"],
  [200_000_000, "#fb6a4a"],
  [300_000_000, "#ef3b2c"],
  [400_000_000, "#cb181d"],
  [500_000_000, "#a50f15"],
  [1_000_000_000, "#67000d"],
]);

const Tip = ({ country, aggregate }) => {
  return <Paper variant="outlined" sx={{ p: 1 }}>
    <><Typography>{country}</Typography>
      {
        aggregate ? <List dense={true}>
          {Object.entries(quantities).map(([quantity, name]) =>
            <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
              <ListItemText primary={`${name}: ${format(aggregate[quantity])}`} style={{ lineHeight: 1, margin: 0 }} />
            </ListItem>,
          )}
        </List> : "No registered aircrafts"
      }</>
  </Paper >
}

const MapChart = () => {
  const [aggregates, setAggregates] = useState<CountryAggregate[]>([]);

  const [target, setTarget] = useState<[string, CountryAggregate]>(null);

  const [year, setYear] = useState<number>(2023);

  useEffect(() => {
    fetchAggregates("country", "year").then(setAggregates)
  }, [])

  const mapping = {
    "Bosnia and Herzegovina": "Bosnia and Herz.",
    "Cayman Islands": "Cayman Is.",
    "Cote d'Ivoire": "Côte d'Ivoire",
    "DR Congo": "Dem. Rep. Congo",
    "Dominican Republic": "Dominican Rep.",
    "Equatorial Guinea": "Eq. Guinea",
    "Kingdom of the Netherlands": "Netherlands",
    "United States": "United States of America",
    "Viet Nam": "Vietnam",
    "Libyan Arab Jamahiriya": "Libya",
  }

  const years = new Map([...new Set(aggregates.map(a => Number(a.date.slice(0, 4))))].map(a => [a, a.toString()]))

  const data = aggregates.filter(v => Number(v.date.slice(0, 4)) == year)

  const colorScale = scaleLinear()
    .domain(colors.keys())
    .range(colors.values())
    .clamp(true)

  return <Box>
    {year ? <SliderSelect values={years} value={year} onChange={setYear} label="Year" /> : null}
    <Typography align="center" variant="h5">
      Emissions of Private Aviation by Country in {year} (kg of CO2)
    </Typography>
    <MapWithScale height={385} colors={colors}>
      <ZoomableGroup>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const cur = data.find(s => (mapping[s.country] || s.country) === geo.properties.name);
              const fill = cur ? colorScale(cur.co2_emitted) : colorScale(0);

              return <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={fill}
                id={geo.rsmKey}
                onMouseEnter={() => {
                  setTarget([geo.properties.name, cur])
                }}
                onMouseLeave={() => setTarget(null)}
              />
            })
          }
        </Geographies>
      </ZoomableGroup>
    </MapWithScale>
    {target != null && <MouseTracker><Tip country={target[0]} aggregate={target[1]} /></MouseTracker>}
  </Box>;
};

export default MapChart;
