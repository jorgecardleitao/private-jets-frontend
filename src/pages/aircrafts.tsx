import { Fragment } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { createColumnHelper } from '@tanstack/react-table';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';

import FlightIcon from '@mui/icons-material/Flight';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import PublicIcon from '@mui/icons-material/Public';
import RadarIcon from '@mui/icons-material/Radar';

import { Aircraft, fetchAircrafts, interpolateMonth } from '../data/aircraft';
import ModelTable from '../table';
import SliderSelect from '../common/sliderSelect';
import SEO from '../common/seo';

const columnHelper = createColumnHelper<Aircraft>();

const columns = [
    columnHelper.accessor('tail_number', {
        header: () => 'Tail number',
        cell: info => (
            <Chip
                label={info.getValue()}
                size="small"
                variant="outlined"
                icon={<AirplaneTicketIcon />}
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
            />
        ),
    }),
    columnHelper.accessor('model', {
        header: () => 'Model',
        cell: info => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightIcon sx={{ fontSize: 15, color: 'text.secondary', transform: 'rotate(45deg)' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{info.getValue()}</Typography>
            </Box>
        ),
    }),
    columnHelper.accessor('country', {
        header: () => 'Country of registration',
        cell: info => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="body2">{info.getValue()}</Typography>
            </Box>
        ),
    }),
    columnHelper.accessor('icao_number', {
        header: () => 'ICAO',
        cell: info => (
            <Chip
                label={info.getValue()}
                component="a"
                href={`https://globe.adsbexchange.com/?icao=${info.getValue()}`}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                size="small"
                variant="outlined"
                color="primary"
                icon={<RadarIcon />}
                sx={{ fontFamily: 'monospace' }}
            />
        ),
    }),
];

const to_month = (a: number): string => {
    const year = Math.floor(a / 12);
    const month = a % 12;
    return `${2019 + year}-${String(1 + month).padStart(2, "0")}`;
};

export default function AircraftsPage({ path, availableMonths }: { path?: string, availableMonths: string[] }) {
    const current = new Date();
    const currentYear = current.getUTCFullYear();
    const currentMonth = current.getUTCMonth();
    const months = useMemo(
        () => new Map([...Array((currentYear - 2019) * 12 + currentMonth).keys()].map(v => [v, to_month(v)])),
        [],
    );

    const [monthIndex, setMonthIndex] = useState<number>(months.size - 1);
    const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

    useEffect(() => {
        if (availableMonths.length === 0) return;
        const target = months.get(monthIndex)!;
        fetchAircrafts(interpolateMonth(target, availableMonths)).then(setAircrafts);
    }, [monthIndex, availableMonths]);

    return (
        <Container maxWidth="lg">
            <SEO
                title="Individual aircrafts"
                description="Browse 25,000+ registered private aircraft by tail number, model, and country of registration."
                path="/aircrafts"
            />
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1 }}>
                <AirplaneTicketIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        Individual aircrafts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {aircrafts.length > 0 ? `${aircrafts.length.toLocaleString()} aircrafts` : 'Loading…'} · sortable &amp; filterable
                    </Typography>
                </Box>
            </Box>

            {/* Explainer */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <RadarIcon sx={{ color: 'primary.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                    Each row is a registered private aircraft tracked via ADS-B transponder signals.
                    Click the <strong>ICAO</strong> chip to view its live position on ADS-B Exchange.
                    Use the month slider to browse the fleet as it was at any point since 2019.
                </Typography>
            </Box>

            {/* Month selector */}
            <Box sx={{ mb: 2 }}>
                <SliderSelect values={months} value={monthIndex} onChange={setMonthIndex} label="Month" marksEvery={12} />
            </Box>

            {/* Table */}
            <Fragment>
                {ModelTable(aircrafts, columns as any)}
            </Fragment>
        </Container>
    );
}
