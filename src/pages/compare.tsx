import { useEffect, useState } from 'preact/hooks';

import { createColumnHelper } from '@tanstack/react-table';

import { ChartsGrid, ChartsTextStyle, ChartsTooltip, ChartsXAxis, ChartsYAxis, ResponsiveChartContainer } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { BarPlot } from '@mui/x-charts/BarChart';

import { ModelAggregate, CountryAggregate, fetchAggregates, quantities, Dimension } from '../data/timeseries';
import ModelTable from '../table';
import Selector from '../common/selector';
import SliderSelect from "../common/sliderSelect";
import { format } from './aggregates';

const dimensions = { "country": "Country of registration", "model": "Aircraft Model" }

export default function Compare() {
    const [is_table, setIsTable] = useState<boolean>(false);
    const [dimension, setDimension] = useState<Dimension>("country");
    const [quantity, setQuantity] = useState<string>("co2_emitted");
    const [year, setYear] = useState<number>(null);
    const [aggregates, setAggregates] = useState<ModelAggregate[] | CountryAggregate[]>([]);

    useEffect(() => {
        fetchAggregates(dimension, "year").then(setAggregates).then(() => setYear(2023))
    }, [dimension])

    const years = new Map([...new Set(aggregates.map(a => Number(a.date.slice(0, 4))))].map(a => [a, a.toString()]))

    let dataset = aggregates.filter(v => Number(v.date.slice(0, 4)) == year).filter(v => v[dimension] != "World");
    dataset.sort((v1, v2) => -(v1[quantity] - v2[quantity]));

    return <Box>
        {year ? <SliderSelect values={years} value={year} onChange={setYear} label="Year" /> : null}
        <FormControlLabel control={<Switch onChange={(_, value) => setIsTable(value)} />} label="Table" />
        <Selector values={dimensions} value={dimension} onChange={setDimension} label="What" />
        {!is_table ? <Selector values={quantities} value={quantity} onChange={setQuantity} label="Quantity" /> : null}
        {is_table ? <AggregateTable dataset={dataset} quantity={quantity} dimension={dimension} /> : <Chart dataset={dataset.slice(0, 30)} quantity={quantity} dimension={dimension} />}
    </Box>
}

interface ChartsProps {
    dataset: ModelAggregate[] | CountryAggregate[]
    quantity: string
    dimension: Dimension
}

function AggregateTable(props: ChartsProps) {
    const columnHelper = createColumnHelper<ModelAggregate | CountryAggregate>()
    const columns = [
        columnHelper.accessor(props.dimension, {
            header: () => dimensions[props.dimension],
            cell: info => info.getValue(),
        }),
        ...Object.entries(quantities).map(([key, name]) => columnHelper.accessor(key, {
            header: () => name,
            cell: info => format(info.getValue() as number),
        }))
    ]
    return ModelTable<ModelAggregate | CountryAggregate>(props.dataset, columns)
}

function Chart(props: ChartsProps) {
    const theme = useTheme();

    return <ResponsiveChartContainer
        margin={{ top: 20, right: 20, bottom: 50, left: 210 }}
        height={2000}
        dataset={props.dataset}
        yAxis={[{ id: 'axis-id', scaleType: 'band', dataKey: props.dimension, tickLabelStyle: theme.typography.body2 as ChartsTextStyle, }]}
        xAxis={[{ valueFormatter: format }]}
        series={[{ layout: "horizontal", type: 'bar', dataKey: props.quantity, color: theme.palette.primary.main, valueFormatter: format }]}
    >
        <BarPlot />
        <ChartsYAxis axisId="axis-id" />
        <ChartsXAxis />
        <ChartsGrid vertical />
        <ChartsTooltip />
    </ResponsiveChartContainer>
}
