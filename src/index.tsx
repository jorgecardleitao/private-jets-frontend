import { Fragment, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import {
	createColumnHelper,
} from '@tanstack/react-table'

import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@emotion/react';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { Tab } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import Home from './pages/home'
import Methodology from './pages/methodology'
import ModelTable from './table';
import { AircraftModel, fetchAircraftModels } from './data/model'
import { Aircraft, fetchAircrafts } from './data/aircraft'
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

function AircraftModelTable({ models }: { models: AircraftModel[] }) {
	const columnHelper = createColumnHelper<AircraftModel>()
	const columns = [
		columnHelper.accessor('model', {
			header: () => 'Model',
			cell: info => info.getValue(),
		}),
		columnHelper.accessor('gph', {
			header: () => 'Consumption (gph)',
			cell: info => Math.round(info.getValue() * 10) / 10,
		}),
		columnHelper.accessor('sources', {
			header: () => 'Source',
			cell: info => <a href={info.getValue()[0].url}>source ({info.getValue()[0].date})</a>,
		})
	]
	return ModelTable<AircraftModel>(models, columns)
}

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
			cell: info => <a href={`https://globe.adsbexchange.com/?icao=${info.getValue()}`}>{info.getValue()}</a >,
		}),
	]
	return ModelTable<Aircraft>(aircrafts, columns)
}

type Tab = "introduction" | "models" | "aircrafts" | "timeseries" | "compare" | "positions" | "methodology"

const NAMES = {
	"introduction": "Introduction",
	"models": "Models",
	"aircrafts": "Aircrafts",
	"timeseries": "In time",
	"compare": "By country and model",
	"positions": "Geopositions",
	"methodology": "Methodology",
}

const DESCRIPTIONS = {
	"introduction": "World map with main statistics per country",
	"models": "All aircraft models used in private aviation",
	"aircrafts": "List of all aicrafts whose model is used in private aviation",
	"timeseries": "Evolution of private aviation in time",
	"compare": "Metrics of private aviation by country and model",
	"positions": "Position of the aircrafts in time",
	"methodology": "Description of how the data was collected and analyzed",
}

const drawerWidth = 240;

export default function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const [mobileOpen, setMobileOpen] = useState(false);

	const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

	const [tab, setTab] = useState<Tab>("introduction");

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
				Private aircrafts
			</Typography>
			<Divider />
			<List>
				{Object.entries(NAMES).map(([page, title]) => (

					<ListItem key={page} disablePadding>
						<Tooltip title={DESCRIPTIONS[page]}>
							<ListItemButton sx={{ textAlign: 'center' }} onClick={(_) => setTab(page as Tab)}>
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
							Private aircrafts
						</Typography>
						<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
							{Object.entries(NAMES).map(([page, title]) => (
								<Tooltip title={DESCRIPTIONS[page]}>
									<Button
										sx={{ ml: 1 }}
										key={page}
										onClick={(_) => setTab(page as Tab)}
										color="inherit"
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
					<Main tab={tab} />
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}

export function Main({ tab }: { tab: Tab }) {
	const [models, setModels] = useState<AircraftModel[]>([]);
	const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

	useEffect(() => {
		fetchAircraftModels().then(setModels)
	}, [])
	useEffect(() => {
		fetchAircrafts().then(setAircrafts)
	}, [])

	const aircraftsFragment = () => <Fragment>
		<Typography component="h2" color="primary" gutterBottom>
			Private aircrafts
		</Typography>
		<AircraftTable aircrafts={aircrafts} />
	</Fragment>;

	const modelsFragment = () => <Fragment>
		<Typography component="h2" color="primary" gutterBottom>
			Private aircraft models
		</Typography>
		<AircraftModelTable models={models} />
	</Fragment>;

	return {
		"introduction": () => <Home />,
		"aircrafts": aircraftsFragment,
		"models": modelsFragment,
		"timeseries": () => <Aggregates />,
		"compare": () => <Compare />,
		"positions": () => <Positions aircrafts={aircrafts} />,
		"methodology": () => <Methodology />,
	}[tab]()
}

render(<App />, document.getElementById('app'));
