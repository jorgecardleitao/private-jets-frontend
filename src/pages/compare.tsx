import { useEffect, useState } from 'preact/hooks';

import { createColumnHelper } from '@tanstack/react-table';

import { ChartsGrid, ChartsTextStyle, ChartsTooltip, ChartsXAxis, ChartsYAxis, ResponsiveChartContainer } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { BarPlot } from '@mui/x-charts/BarChart';

import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';

import { ModelAggregate, CountryAggregate, fetchAggregates, quantities, Dimension } from '../data/timeseries';
import ModelTable from '../table';
import Selector from '../common/selector';
import SliderSelect from "../common/sliderSelect";
import { format } from './aggregates';

const dimensions = { "country": "Country of registration", "model": "Aircraft Model" }

export default function Compare({ path }: { path?: string } = {}) {
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

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 3 }}>
                <CompareArrowsIcon sx={{ fontSize: 36, color: 'warning.main' }} />
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        By country &amp; model
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Rank countries or aircraft models by any metric for a given year
                    </Typography>
                </Box>
            </Box>

            {/* Controls */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: year ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Selector values={dimensions} value={dimension} onChange={setDimension} label="Group by" />
                        {!is_table && <Selector values={quantities} value={quantity} onChange={setQuantity} label="Quantity" />}
                    </Box>
                    <ToggleButtonGroup
                        size="small"
                        value={is_table ? 'table' : 'chart'}
                        exclusive
                        onChange={(_, v) => { if (v !== null) setIsTable(v === 'table'); }}
                    >
                        <ToggleButton value="chart"><ShowChartIcon sx={{ mr: 0.5 }} />Chart</ToggleButton>
                        <ToggleButton value="table"><TableChartIcon sx={{ mr: 0.5 }} />Table</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {year && (
                    <Box sx={{ px: 1 }}>
                        <SliderSelect values={years} value={year} onChange={setYear} label="Year" />
                    </Box>
                )}
            </Paper>

            {/* Content */}
            <Paper variant="outlined" sx={{ p: 2 }}>
                {is_table
                    ? <AggregateTable dataset={dataset} quantity={quantity} dimension={dimension} />
                    : <Chart dataset={dataset.slice(0, 30)} quantity={quantity} dimension={dimension} />
                }
            </Paper>
        </Container>
    );
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
        margin={{ top: 100, right: 30, bottom: 50, left: 210 }}
        height={2000}
        dataset={props.dataset}
        yAxis={[{ id: 'axis-id', scaleType: 'band', dataKey: props.dimension, tickLabelStyle: theme.typography.body2 as ChartsTextStyle, }]}
        xAxis={[{ valueFormatter: format, label: quantities[props.quantity], tickLabelStyle: theme.typography.body2 as ChartsTextStyle }]}
        series={[{ layout: "horizontal", type: 'bar', dataKey: props.quantity, color: theme.palette.primary.main, valueFormatter: format }]}
    >
        <BarPlot />
        <ChartsYAxis axisId="axis-id" />
        <ChartsXAxis position={"top"} />
        <ChartsGrid vertical />
        <ChartsTooltip />
    </ResponsiveChartContainer>
}
