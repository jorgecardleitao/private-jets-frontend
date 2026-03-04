import { render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import Router, { route, getCurrentUrl } from 'preact-router';

import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@emotion/react';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import Home from './pages/home'
import ModelsPage from './pages/models'
import Methodology from './pages/methodology'
import { AircraftModel, fetchAircraftModels } from './data/model'
import { fetchAircraftMonths } from './data/aircraft'
import AircraftsPage from './pages/aircrafts'
import Aggregates from './pages/aggregates';
import Compare from './pages/compare';
import Positions from './pages/position';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import Footer from './footer';

type Tab = "introduction" | "models" | "aircrafts" | "timeseries" | "compare" | "positions" | "methodology"

const NAMES: Record<Tab, string> = {
	"introduction": "Introduction",
	"models": "Models",
	"aircrafts": "Aircrafts",
	"timeseries": "In time",
	"compare": "By country and model",
	"positions": "Geopositions",
	"methodology": "Methodology",
}

const DESCRIPTIONS: Record<Tab, string> = {
	"introduction": "World map with main statistics per country",
	"models": "All aircraft models used in private aviation",
	"aircrafts": "List of all aicrafts whose model is used in private aviation",
	"timeseries": "Evolution of private aviation in time",
	"compare": "Metrics of private aviation by country and model",
	"positions": "Position of the aircrafts in time",
	"methodology": "Description of how the data was collected and analyzed",
}

const ROUTES: Record<Tab, string> = {
	"introduction": "/",
	"models": "/models",
	"aircrafts": "/aircrafts",
	"timeseries": "/timeseries",
	"compare": "/compare",
	"positions": "/positions",
	"methodology": "/methodology",
}

const drawerWidth = 240;

export default function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [mobileOpen, setMobileOpen] = useState(false);
	const [currentUrl, setCurrentUrl] = useState(getCurrentUrl());

	const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: mode,
				},
			}),
		[mode],
	);

	const handleDrawerToggle = () => {
		setMobileOpen(prevState => !prevState);
	};

	const drawer = (
		<Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
			<Typography variant="h6" sx={{ my: 2 }}>
				Private Aviation
			</Typography>
			<Divider />
			<List>
				{(Object.entries(NAMES) as [Tab, string][]).map(([page, title]) => (

					<ListItem key={page} disablePadding>
						<Tooltip title={DESCRIPTIONS[page]}>
							<ListItemButton sx={{ textAlign: 'center' }} onClick={() => route(ROUTES[page])}>
								<ListItemText primary={title} />
							</ListItemButton>
						</Tooltip>
					</ListItem>

				))}
			</List>
		</Box >
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<Box>
				<AppBar component="nav">
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 2, display: { sm: 'none' } }}
						>
							<MenuIcon />
						</IconButton>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
						>
							Private Aviation
						</Typography>
						<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
							{(Object.entries(NAMES) as [Tab, string][]).map(([page, title]) => (
								<Tooltip title={DESCRIPTIONS[page]}>
									<Button
										sx={{ ml: 1, fontWeight: currentUrl === ROUTES[page] ? 'bold' : 'normal' }}
										key={page}
										href={ROUTES[page]}
										onClick={(e) => { e.preventDefault(); route(ROUTES[page]); }}
										color="inherit"
										variant={currentUrl === ROUTES[page] ? 'outlined' : 'text'}
									>
										{title}
									</Button>
								</Tooltip>
							))}
						</Box>
						<IconButton sx={{ ml: 1 }} onClick={() => setMode(theme.palette.mode == 'dark' ? 'light' : 'dark')} color="inherit">
							{theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
						</IconButton>
					</Toolbar>
				</AppBar>
				<nav>
					<Drawer
						variant="temporary"
						open={mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
						sx={{
							display: { xs: 'block', sm: 'none' },
							'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
						}}
					>
						{drawer}
					</Drawer>
				</nav>
				<Box component="main" sx={{ p: 3 }}>
					<Toolbar />
					<Main onRouteChange={setCurrentUrl} />
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}



export function Main({ onRouteChange }: { onRouteChange?: (url: string) => void }) {
	const [models, setModels] = useState<AircraftModel[]>([]);
	const [availableAircraftMonths, setAvailableAircraftMonths] = useState<string[]>([]);

	useEffect(() => {
		fetchAircraftModels().then(setModels)
	}, [])
	useEffect(() => {
		fetchAircraftMonths().then(setAvailableAircraftMonths)
	}, [])

	return (
		<Router onChange={(e) => onRouteChange?.(e.url)}>
			<Home path="/" />
			<ModelsPage path="/models" models={models} />
			<AircraftsPage path="/aircrafts" availableMonths={availableAircraftMonths} />
			<Aggregates path="/timeseries" />
			<Compare path="/compare" />
			<Positions path="/positions" availableMonths={availableAircraftMonths} />
			<Methodology path="/methodology" />
		</Router>
	);
}

render(<App />, document.getElementById('app'));
