import { Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import {
    createColumnHelper,
} from '@tanstack/react-table'

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import FlightIcon from '@mui/icons-material/Flight';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

import ModelTable from '../table';
import { AircraftModel } from '../data/model';

/** Map a gph value to a CSS color interpolated from green → amber → red */
function gphColor(gph: number, min: number, max: number): string {
    const t = Math.max(0, Math.min(1, (gph - min) / (max - min)));
    if (t < 0.5) {
        // green → amber
        const r = Math.round(76 + (251 - 76) * (t / 0.5));
        const g = Math.round(175 + (192 - 175) * (t / 0.5));
        const b = Math.round(80 + (0 - 80) * (t / 0.5));
        return `rgb(${r},${g},${b})`;
    } else {
        // amber → red
        const s = (t - 0.5) / 0.5;
        const r = Math.round(251 + (211 - 251) * s);
        const g = Math.round(192 + (47 - 192) * s);
        const b = Math.round(0 + (47 - 0) * s);
        return `rgb(${r},${g},${b})`;
    }
}

function GphCell({ gph, min, max }: { gph: number; min: number; max: number }) {
    const pct = Math.round(((gph - min) / (max - min)) * 100);
    const color = gphColor(gph, min, max);
    return (
        <Tooltip title={`${Math.round(gph * 10) / 10} gal/hr`} arrow>
            <Box sx={{ minWidth: 120 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {Math.round(gph * 10) / 10}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">gph</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3, transition: 'width 0.3s' }} />
                </Box>
            </Box>
        </Tooltip>
    );
}

const columnHelper = createColumnHelper<AircraftModel & { _min: number; _max: number }>();

export default function ModelsPage({ models, path }: { models: AircraftModel[]; path?: string }) {
    const gphs = useMemo(() => models.map(m => m.gph), [models]);
    const minGph = useMemo(() => Math.min(...gphs), [gphs]);
    const maxGph = useMemo(() => Math.max(...gphs), [gphs]);

    const enriched = useMemo(
        () => models.map(m => ({ ...m, _min: minGph, _max: maxGph })),
        [models, minGph, maxGph],
    );

    const columns = useMemo(() => [
        columnHelper.accessor('model', {
            header: () => 'Model',
            cell: info => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightIcon sx={{ fontSize: 16, color: 'text.secondary', transform: 'rotate(45deg)' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{info.getValue()}</Typography>
                </Box>
            ),
        }),
        columnHelper.accessor('gph', {
            header: () => 'Fuel consumption',
            cell: info => (
                <GphCell
                    gph={info.getValue()}
                    min={info.row.original._min}
                    max={info.row.original._max}
                />
            ),
        }),
        columnHelper.accessor('sources', {
            header: () => 'Source',
            cell: info => {
                const src = info.getValue()[0];
                let domain: string;
                try {
                    domain = new URL(src.url).hostname.replace(/^www\./, '');
                } catch {
                    domain = src.url;
                }
                return (
                    <Chip
                        label={domain}
                        component="a"
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        size="small"
                        variant="outlined"
                    />
                );
            },
        }),
    ], []);

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 1 }}>
                <FlightIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        Private aircraft models
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {models.length} models · sortable &amp; filterable
                    </Typography>
                </Box>
            </Box>

            {/* Explainer */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <LocalGasStationIcon sx={{ color: 'warning.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                    <strong>Fuel consumption</strong> is expressed in gallons per hour (gph) and represents the average
                    across all sources for that model. The colour bar goes from <span style={{ color: 'rgb(76,175,80)', fontWeight: 600 }}>low</span> to <span style={{ color: 'rgb(211,47,47)', fontWeight: 600 }}>high</span> consumption.
                    Use the sort arrows and filter controls in each column header to explore the data.
                </Typography>
            </Box>

            {/* Table */}
            <Fragment>
                {ModelTable(enriched, columns as any)}
            </Fragment>
        </Container>
    );
}
