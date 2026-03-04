import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { createColumnHelper } from '@tanstack/react-table';
import Typography from '@mui/material/Typography';

import { Aircraft, fetchAircrafts, fetchAircraftMonths, interpolateMonth } from '../data/aircraft';
import ModelTable from '../table';
import SliderSelect from '../common/sliderSelect';

function AircraftTable({ aircrafts }: { aircrafts: Aircraft[] }) {
    const columnHelper = createColumnHelper<Aircraft>()
    const columns = [
        columnHelper.accessor('tail_number', {
            header: () => 'Tail number',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('model', {
            header: () => 'Model',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('country', {
            header: () => 'Country of registration',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('icao_number', {
            header: () => 'ICAO number',
            cell: info => <a href={`https://globe.adsbexchange.com/?icao=${info.getValue()}`}>{info.getValue()}</a>,
        }),
    ]
    return ModelTable<Aircraft>(aircrafts, columns)
}

const to_month = (a: number): string => {
    const year = Math.floor(a / 12);
    const month = a % 12;
    return `${2019 + year}-${String(1 + month).padStart(2, "0")}`
}

export default function AircraftsPage({ path }: { path?: string }) {
    const current = new Date();
    const currentYear = current.getUTCFullYear();
    const currentMonth = current.getUTCMonth();
    const months = new Map([...Array((currentYear - 2019) * 12 + currentMonth).keys()].map(v => [v, to_month(v)]));

    const [monthIndex, setMonthIndex] = useState<number>(months.size - 1);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

    useEffect(() => {
        fetchAircraftMonths().then(setAvailableMonths);
    }, []);

    useEffect(() => {
        if (availableMonths.length === 0) return;
        const target = months.get(monthIndex)!;
        fetchAircrafts(interpolateMonth(target, availableMonths)).then(setAircrafts);
    }, [monthIndex, availableMonths]);

    return <Fragment>
        <Typography component="h2" color="primary" gutterBottom>
            Private aircrafts
        </Typography>
        <SliderSelect values={months} value={monthIndex} onChange={setMonthIndex} label="Month" marksEvery={12} />
        <AircraftTable aircrafts={aircrafts} />
    </Fragment>;
}
