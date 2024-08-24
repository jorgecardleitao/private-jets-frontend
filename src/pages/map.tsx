import { useEffect, useState } from "preact/hooks";

import { scaleQuantile } from "d3-scale";

import {
  ComposableMap,
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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

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

  const [year, setYear] = useState<number>(null);

  useEffect(() => {
    fetchAggregates("country", "year").then(setAggregates).then(() => setYear(2023))
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

  const colorScale = scaleQuantile()
    .domain(aggregates.map(d => d.co2_emitted))
    .range([
      "#08306b",
      "#08519c",
      "#2171b5",
      "#4292c6",
      "#6baed6",
      "#9ecae1",
      "#c6dbef",
      "#deebf7",
      "#fee0d2",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#a50f15",
      "#67000d",
    ]);

  return <Box sx={{ mx: 8 }}>
    {year ? <SliderSelect values={years} value={year} onChange={setYear} label="Year" /> : null}
    <ComposableMap height={500}>
      <ZoomableGroup>
        <Geographies geography={geoUrl} projectionConfig={{ scale: 1 }}>
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
    </ComposableMap>
    {target != null && <MouseTracker><Tip country={target[0]} aggregate={target[1]} /></MouseTracker>}
  </Box>;
};

export default MapChart;
