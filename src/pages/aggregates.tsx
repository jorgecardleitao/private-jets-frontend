import { ChartsAxisHighlight, ChartsGrid, ChartsTextStyle, ChartsTooltip, ChartsXAxis, ChartsYAxis, LineHighlightPlot, LinePlot, ResponsiveChartContainer, axisClasses } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useEffect, useState } from 'preact/hooks';

import { Aggregate, fetchAggregates, Scale } from '../data/timeseries';
import ModelTable from '../table';
import { createColumnHelper } from '@tanstack/react-table';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

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

/**
 * Outputs an object with amount and si and iec units.
 * @param {number} amount Number of bits or bytes
 */
export function kilomega(amount: number) {
    const exp = amount === 0 ? 0 : Math.floor(Math.log(amount) / Math.log(1024));
    const factor = Math.pow(1024, exp);

    return {
        amount: amount / factor,
        symbol: units[exp]["symbol"],
    }
}

interface Quantities {
    [name: string]: string
}

const quantities: Quantities = {
    "time_flown": "Time flown (hours)",
    "co2_emitted": "Emissions (kg CO2)",
    "number_of_aircrafts": "Number of aircrafts",
    "number_of_legs": "Number of legs",
    "km_travelled": "Distance travelled (km)",
}

const scales: Quantities = {
    "by_year": "Years",
    "by_month": "Months",
    "by_day": "Days",
}

const formatValue = {
    "by_year": value => value.slice(0, -6),
    "by_month": value => value.slice(0, -3),
    "by_day": value => value,
}

const xAxis = {
    "by_year": {
        valueFormatter: (value, _) => value.slice(0, -6)
    },
    "by_month": {
        valueFormatter: (value, _) => value.slice(0, -3)
    },
    "by_day": {
        tickLabelInterval: (_, index) => index % 30 === 0,
        tickInterval: (_, index) => index % 10 === 0,
    },
}

function format(value: number): string {
    const scaled = kilomega(value);
    return `${scaled.amount.toFixed(1)} ${scaled.symbol}`
}

export function Aggregates() {
    const [is_table, setIsTable] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<string>("co2_emitted");
    const [scale, setScale] = useState<Scale>("by_day");
    const [aggregates, setAggregates] = useState<Aggregate[]>([]);

    useEffect(() => {
        fetchAggregates(scale).then(setAggregates)
    }, [scale])

    return <Box>
        <FormControlLabel control={<Switch onChange={(_, value) => setIsTable(value)} />} label="Table" />
        {!is_table ? <Selector values={quantities} value={quantity} onChange={setQuantity} label="Quantity" /> : null}
        <Selector values={scales} value={scale} onChange={setScale} label="Time scale" />
        {is_table ? <AggregateTable aggregates={aggregates} scale={scale} quantity={quantity} /> : <Chart aggregates={aggregates} scale={scale} quantity={quantity} />}
    </Box>
}

interface ChartsProps {
    aggregates: Aggregate[]
    scale: string
    quantity: string
}

function AggregateTable(props: ChartsProps) {
    const columnHelper = createColumnHelper<Aggregate>()
    const columns = [
        columnHelper.accessor('date', {
            header: () => scales[props.scale],
            cell: info => formatValue[props.scale](info.getValue()),
        }),
        columnHelper.accessor('number_of_legs', {
            header: () => 'Number of legs',
            cell: info => format(info.getValue()),
        }),
        columnHelper.accessor('time_flown', {
            header: () => 'Total flown time (hours)',
            cell: info => format(info.getValue()),
        }),
        columnHelper.accessor('co2_emitted', {
            header: () => 'CO2 emissions (kg CO2)',
            cell: info => format(info.getValue()),
        }),
    ]
    return ModelTable<Aggregate>(props.aggregates, columns)
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
                color: theme.palette.primary.light,
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

interface SelectorProps {
    values: Quantities
    value: string
    onChange: (arg0: any) => void
    label: string
}

function Selector(props: SelectorProps) {
    return <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id={`${props.label}-label`}>{props.label}</InputLabel>
        <Select
            labelId={`${props.label}-label`}
            id={props.label}
            value={props.value}
            onChange={e => props.onChange((e.target as HTMLTextAreaElement).value)}
            autoWidth
            label="Option"
        >
            {
                Object.entries(props.values).map(([k, v]) => {
                    return <MenuItem value={k}>{v}</MenuItem>
                })
            }
        </Select>
    </FormControl>
}
