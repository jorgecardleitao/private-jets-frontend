import { ChartsAxisHighlight, ChartsGrid, ChartsTextStyle, ChartsTooltip, ChartsXAxis, ChartsYAxis, LineHighlightPlot, LinePlot, ResponsiveChartContainer, axisClasses } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { createColumnHelper } from '@tanstack/react-table';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { useEffect, useState } from 'preact/hooks';

import { CountryAggregate, fetchAggregates, Scale, quantities, Quantity } from '../data/timeseries';
import ModelTable from '../table';
import Selector from '../common/selector';

const units = [
    { prefix: "", symbol: "", iecPrefix: "", iecSymbol: "" },
    { prefix: "kilo", symbol: "k", iecPrefix: "kibi", iecSymbol: "Ki" },
    { prefix: "mega", symbol: "M", iecPrefix: "mebi", iecSymbol: "Mi" },
    { prefix: "giga", symbol: "G", iecPrefix: "gibi", iecSymbol: "Gi" },
    { prefix: "tera", symbol: "T", iecPrefix: "tebi", iecSymbol: "Ti" },
    { prefix: "peta", symbol: "P", iecPrefix: "pebi", iecSymbol: "Pi" },
    { prefix: "exa", symbol: "E", iecPrefix: "exbi", iecSymbol: "Ei" },
    { prefix: "zetta", symbol: "Z", iecPrefix: "zebi", iecSymbol: "Zi" },
    { prefix: "yotta", symbol: "Y", iecPrefix: "yobi", iecSymbol: "Yi" },
];

function kilomega(amount: number) {
    const exp = amount === 0 ? 0 : Math.floor(Math.log(amount) / Math.log(1000));
    const factor = Math.pow(1000, exp);

    return {
        amount: amount / factor,
        symbol: units[exp]["symbol"],
    }
}

export function format(value: number): string {
    const scaled = kilomega(value);
    return `${scaled.amount.toFixed(1)} ${scaled.symbol}`
}

interface Quantities {
    [name: string]: string
}

const scales: Quantities = {
    "year": "Years",
    "month": "Months",
    "day": "Days",
}

const formatValue = {
    "year": value => value.slice(0, -6),
    "month": value => value.slice(0, -3),
    "day": value => value,
}

const xAxis = {
    "year": {
        valueFormatter: (value, _) => value.slice(0, -6)
    },
    "month": {
        valueFormatter: (value, _) => value.slice(0, -3)
    },
    "day": {},
}

export default function Aggregates() {
    const [country, setCountry] = useState<string>("World");
    const [is_table, setIsTable] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<Quantity>("co2_emitted");
    const [scale, setScale] = useState<Scale>("month");
    const [aggregates, setAggregates] = useState<CountryAggregate[]>([]);

    useEffect(() => {
        fetchAggregates("country", scale).then(setAggregates)
    }, [scale])

    const countries = Object.fromEntries(aggregates.length > 0 ? aggregates.map(v => [v.country, v.country]) : [["World", "World"]])
    const dataset = aggregates.filter(v => v.country == country)

    return <Box>
        <FormControlLabel control={<Switch onChange={(_, value) => setIsTable(value)} />} label="Table" />
        {!is_table ? <Selector values={quantities} value={quantity} onChange={setQuantity} label="Quantity" /> : null}
        <Selector values={countries} value={country} onChange={setCountry} label="Country of registration" />
        <Selector values={scales} value={scale} onChange={setScale} label="Time scale" />
        {is_table ? <AggregateTable aggregates={dataset} scale={scale} quantity={quantity} /> : <Chart aggregates={dataset} scale={scale} quantity={quantity} />}
    </Box>
}

interface ChartsProps {
    aggregates: CountryAggregate[]
    scale: Scale
    quantity: Quantity
}

function AggregateTable(props: ChartsProps) {
    const columnHelper = createColumnHelper<CountryAggregate>()
    const columns = [
        columnHelper.accessor('date', {
            header: () => scales[props.scale],
            cell: info => formatValue[props.scale](info.getValue()),
        }),
        ...Object.entries(quantities).map(([key, name]: [Quantity, string]) => columnHelper.accessor(key, {
            header: () => name,
            cell: info => format(info.getValue() as number),
        }))
    ]
    return ModelTable<CountryAggregate>(props.aggregates, columns)
}

function Chart(props: ChartsProps) {
    const theme = useTheme();

    return <ResponsiveChartContainer
        margin={{ top: 20, right: 20, bottom: 50, left: 100 }}
        height={300}
        dataset={props.aggregates}
        xAxis={[
            {
                scaleType: 'point',
                dataKey: "date",
                tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
                tickLabelInterval: (value, _) => value.slice(-5) === "01-01",
                tickInterval: (value, _) => value.slice(-5) === "01-01",
                ...xAxis[props.scale]
            },
        ]}
        yAxis={[
            {
                min: 0,
                label: quantities[props.quantity],
                tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
                valueFormatter: format,
            },
        ]}
        series={[
            {
                type: "line",
                curve: "linear",
                dataKey: props.quantity,
                showMark: false,
                color: theme.palette.primary.main,
            },
        ]}
        sx={{
            [`.${axisClasses.left} .${axisClasses.label}`]: {
                transform: 'translate(-40px, 0)',
            },
            [`.${axisClasses.right} .${axisClasses.label}`]: {
                transform: 'translate(40px, 0)',
            },
        }}
    >
        <LinePlot skipAnimation />
        <ChartsGrid horizontal />
        <ChartsXAxis />
        <ChartsYAxis />
        <ChartsTooltip />
        <LineHighlightPlot />
        <ChartsAxisHighlight x="line" />
    </ResponsiveChartContainer>
}
