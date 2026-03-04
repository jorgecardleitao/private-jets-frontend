import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FlightIcon from '@mui/icons-material/Flight';
import PublicIcon from '@mui/icons-material/Public';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import { route } from 'preact-router';

import WorldMap from "./map";

const stats = [
    { value: "70+", label: "Aircraft models" },
    { value: "25,000+", label: "Tracked aircrafts" },
    { value: "30M+", label: "Hours flown" },
    { value: "2019-", label: "Data coverage" },
];

const features = [
    {
        icon: <FlightIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
        title: "Aircraft models",
        description: "Explore over 70 private jet and turboprop models, their fuel consumption, and market share.",
        href: "/models",
    },
    {
        icon: <AirplaneTicketIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
        title: "Individual aircrafts",
        description: "Browse 25,000+ registered aircrafts by tail number, model, and country of registration.",
        href: "/aircrafts",
    },
    {
        icon: <TimelineIcon sx={{ fontSize: 36, color: 'success.main' }} />,
        title: "Trends over time",
        description: "See how private aviation has evolved since 2019 — legs flown, hours airborne, and distances covered.",
        href: "/timeseries",
    },
    {
        icon: <CompareArrowsIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
        title: "By country & model",
        description: "Compare market share across countries and models by flights, distance, and fleet size.",
        href: "/compare",
    },
    {
        icon: <PublicIcon sx={{ fontSize: 36, color: 'error.main' }} />,
        title: "Geopositions",
        description: "Track where private jets are flying — live aircraft positions rendered on an interactive map.",
        href: "/positions",
    },
    {
        icon: <MenuBookIcon sx={{ fontSize: 36, color: 'info.main' }} />,
        title: "Methodology",
        description: "Understand how the data is collected, processed, and validated from ADS-B transponder signals.",
        href: "/methodology",
    },
];

export default function Home({ path }: { path?: string } = {}) {
    return (
        <Container maxWidth="lg">
            {/* Hero */}
            <Box sx={{ textAlign: 'center', my: 6 }}>
                <FlightIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Private Aviation Worldwide
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 640, mx: 'auto' }}>
                    An open dataset tracking every private jet flight on the planet — models, registrations, routes, and emissions.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button variant="contained" size="large" onClick={() => route('/timeseries')}>
                        Explore trends
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => route('/compare')}>
                        Compare countries
                    </Button>
                </Box>
            </Box>

            {/* Stats bar */}
            <Paper variant="outlined" sx={{ mb: 6 }}>
                <Grid container>
                    {stats.map((s, i) => (
                        <Grid size={{ xs: 6, md: 3 }} key={i}>
                            <Box sx={{
                                textAlign: 'center', py: 3, px: 2,
                                borderRight: i < stats.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                            }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {s.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {s.label}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* World map */}
            <WorldMap />

            <Divider sx={{ my: 6 }} />

            {/* Feature cards */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Explore the data
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {features.map((f) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.href}>
                        <Card elevation={2} sx={{ height: '100%' }}>
                            <CardActionArea sx={{ height: '100%' }} onClick={() => route(f.href)}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        {f.icon}
                                        <Typography variant="h6" component="h3" sx={{ ml: 1.5 }}>
                                            {f.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {f.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
