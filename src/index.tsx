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
import FlightIcon from '@mui/icons-material/Flight';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import Home from './pages/home'
import ModelTable from './table';
import { AircraftModel, fetchAircraftModels } from './data/model'
import { Aircraft, fetchAircrafts } from './data/aircraft'
import Aggregates from './pages/aggregates';
import Compare from './pages/compare';

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

type Tab = "introduction" | "models" | "aircrafts" | "timeseries" | "compare"

const NAMES = {
	"introduction": "Introduction",
	"models": "Models",
	"aircrafts": "Aircrafts",
	"timeseries": "In time",
	"compare": "By country and model",
}

export function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
				},
			}),
		[prefersDarkMode],
	);

	const [tab, setTab] = useState<Tab>("timeseries");

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

	const pages = {
		"introduction": () => <Home />,
		"aircrafts": aircraftsFragment,
		"models": modelsFragment,
		"timeseries": () => <Aggregates />,
		"compare": () => <Compare />,
	}

	const fragment = pages[tab]()

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			<Box>
				<AppBar position='static'>
					<Toolbar>
						<FlightIcon />

						{Object.entries(NAMES).map(([page, title]) => (
							<Button
								key={page}
								onClick={(_) => setTab(page as Tab)}
								color="inherit"
							>
								{title}
							</Button>
						))}
					</Toolbar>
				</AppBar>
				<Box sx={{ mt: 2, mx: 2 }}>{fragment}</Box>

			</Box>
		</ThemeProvider >
	);
}

render(<App />, document.getElementById('app'));
