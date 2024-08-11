import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';


import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	Header,
	useReactTable,
} from '@tanstack/react-table'


import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './theme';

import CSV from './csv'

type Source = {
	url: string
	date: string
}

type AircraftModel = {
	name: string
	gph: number
	sources: Source[]
};

type AircraftModels = AircraftModel[];

function loadAircraftModel(content: string): AircraftModels {
	//let url = "https://private-jets.fra1.digitaloceanspaces.com/model/db/data.csv"
	const data = CSV.parse(content);
	console.assert(data[0].sort().toString() === ["model", "gph", "source", "date"].sort().toString());

	const aggre: Map<string, [AircraftModel, number]> = data.slice(1).reduce(function (acc: Map<string, [AircraftModel, number]>, x: any[]) {
		const model = x[0];
		if (acc.has(model)) {
			let entry = acc.get(model)
			entry[0].gph += x[1]
			entry[0].sources.push({
				url: x[2],
				date: x[3],
			})
			entry[1] += 1
			acc.set(model, entry)
		} else {
			acc.set(model, [{
				name: model,
				gph: x[1],
				sources: [{
					url: x[2],
					date: x[3],
				}]
			}, 1])
		}

		return acc;
	}, new Map);

	return Array.from(aggre
		.entries()).map(([key, value]) => {
			value[0].gph /= value[1];
			return value[0]
		})
}

async function fetchAircraftModel(): Promise<AircraftModels> {
	const url = "https://private-jets.fra1.digitaloceanspaces.com/model/db/data.csv";
	return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAircraftModel)
}

const columnHelper = createColumnHelper<AircraftModel>()
const columns = [
	columnHelper.accessor('name', {
		header: () => 'Model',
		cell: info => info.getValue(),
	}),
	columnHelper.accessor('gph', {
		header: () => 'Consumption (gph)',
		cell: info => info.getValue(),
	}),
	columnHelper.accessor('sources', {
		header: () => 'Sources',
		cell: info => info.getValue()[0].url,
	})
]

export function App() {
	const [data, setData] = useState<AircraftModels>([]);

	useEffect(() => {
		fetchAircraftModel().then(setData)
	}, [])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	const headerFragment = (header: Header<AircraftModel, unknown>) => {
		console.log(header.column.getCanSort())
		return <div
			className={
				header.column.getCanSort()
					? 'cursor-pointer select-none'
					: ''
			}
			onClick={header.column.getToggleSortingHandler()}
			title={
				header.column.getCanSort()
					? header.column.getNextSortingOrder() === 'asc'
						? 'Sort ascending'
						: header.column.getNextSortingOrder() === 'desc'
							? 'Sort descending'
							: 'Clear sort'
					: undefined
			}
		>
			{flexRender(
				header.column.columnDef.header,
				header.getContext()
			)}
			{{
				asc: ' 🔼',
				desc: ' 🔽',
			}[header.column.getIsSorted() as string] ?? null}
		</div>
	}

	const tableFrag = <table>
		<thead>
			{table.getHeaderGroups().map(headerGroup => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map(header => (
						<th key={header.id}>
							{header.isPlaceholder ? null : headerFragment(header)}
						</th>
					))}
				</tr>
			))}
		</thead>
		<tbody>
			{table.getRowModel().rows.map(row => (
				<tr key={row.id}>
					{row.getVisibleCells().map(cell => (
						<td key={cell.id}>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</td>
					))}
				</tr>
			))}
		</tbody>
	</table>;

	return (
		<Container maxWidth="sm">
			<Box sx={{ my: 4 }}>
				<Typography variant="h4" component="h1" sx={{ mb: 2 }}>
					Material UI Preact example
				</Typography>
				{tableFrag}
			</Box>
		</Container>
	);
}

render(<App />, document.getElementById('app'));
