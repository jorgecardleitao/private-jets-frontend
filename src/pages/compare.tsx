import { ChartsGrid, ChartsTextStyle, ChartsTooltip, ChartsXAxis, ChartsYAxis, ResponsiveChartContainer } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { BarPlot } from '@mui/x-charts/BarChart';

import { useEffect, useState } from 'preact/hooks';

import { Aggregate, fetchAggregates, quantities, Dimension } from '../data/timeseries';
import ModelTable from '../table';
import { format } from './aggregates';
import Selector from '../selector';
import { createColumnHelper } from '@tanstack/react-table';

export default function Compare() {
    const [is_table, setIsTable] = useState<boolean>(false);
    const [dimension, setDimension] = useState<Dimension>("country");
    const [quantity, setQuantity] = useState<string>("co2_emitted");
    const [aggregates, setAggregates] = useState<Aggregate[]>([]);

    useEffect(() => {
        fetchAggregates(dimension, "year").then(setAggregates)
    }, [dimension])

    let dataset = aggregates.filter(v => v.date.slice(0, 4) == "2023");
    dataset.sort((v1, v2) => -(v1[quantity] - v2[quantity]));

    return <Box>
        <FormControlLabel control={<Switch onChange={(_, value) => setIsTable(value)} />} label="Table" />
        <Selector values={{ "country": "Country", "model": "Aircraft Model" }} value={dimension} onChange={setDimension} label="What" />
        {!is_table ? <Selector values={quantities} value={quantity} onChange={setQuantity} label="Quantity" /> : null}
        {is_table ? <AggregateTable dataset={dataset} quantity={quantity} dimension={dimension} /> : <Chart dataset={dataset.slice(0, 30)} quantity={quantity} dimension={dimension} />}
    </Box>
}

interface ChartsProps {
    dataset: Aggregate[]
    quantity: string
    dimension: Dimension
}

function AggregateTable(props: ChartsProps) {
    const columnHelper = createColumnHelper<Aggregate>()
    const columns = [
        columnHelper.accessor(props.dimension, {
            header: () => "Country",
            cell: info => info.getValue(),
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
    return ModelTable<Aggregate>(props.dataset, columns)
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
