import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Header,
    useReactTable,
} from '@tanstack/react-table'

import {
    PaginationState,
    getPaginationRowModel,
} from '@tanstack/react-table'

import {
    getFilteredRowModel,
    Column,
    Table as ReactTable,
} from '@tanstack/react-table'

import { useState } from 'preact/hooks';

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';

function ModelTable<Model>(data: Model[], columns: ColumnDef<Model, any>[]) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    })
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
    })

    const sortFragment = (header: Header<Model, unknown>) => {
        const isSorted = header.column.getIsSorted();
        return <Grid container>
            <Grid item style={{ display: "flex" }}>
                <TableSortLabel

                    active={isSorted !== false}
                    direction={isSorted !== false ? isSorted : 'asc'}
                    onClick={header.column.getToggleSortingHandler()}
                >
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {isSorted !== false ? (
                        <Box component="span" sx={visuallyHidden}>
                            {isSorted == 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                    ) : null}

                </TableSortLabel>
            </Grid>
            <Grid item xs={6}>
                {
                    header.column.getCanFilter() ? (
                        <Filter column={header.column} table={table} />
                    ) : null
                }
            </Grid>
        </Grid >
    };

    return <TableContainer>
        <Table>
            <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableCell key={header.id}>
                                {header.isPlaceholder ? null : sortFragment(header)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            <TableBody>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <TablePagination
            component="div"
            count={table.getRowCount()}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            rowsPerPage={table.getState().pagination.pageSize}
            onRowsPerPageChange={e => table.setPageSize(Number((e.target as HTMLTextAreaElement).value))}
        />
    </TableContainer>
}

export default ModelTable;

function Filter({
    column,
    table,
}: {
    column: Column<any, any>
    table: ReactTable<any>
}) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id)

    const filterValue = column.getFilterValue()

    if (typeof firstValue !== 'number') {
        const value = (filterValue ?? '') as string;
        return <TextField
            size="small"
            label="Filter"
            onChange={e => column.setFilterValue((e.target as HTMLTextAreaElement).value)}
            value={value}
        />
    }

    const values = table.getPreFilteredRowModel().flatRows.map(row => row.getValue(column.id)) as number[]
    const min = Math.min(...values)
    const max = Math.max(...values)

    const value = filterValue as [number, number] ?? [min, max];

    return <Slider
        min={min}
        max={max}
        getAriaLabel={() => 'Range'}
        value={value}
        onChange={(_, newValue) =>
            column.setFilterValue(newValue)
        }
        valueLabelDisplay="auto"
    />
}
