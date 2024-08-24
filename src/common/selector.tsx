import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface SelectorProps {
    values: { [name: string]: string }
    value: string
    onChange: (arg0: any) => void
    label: string
}

export default function Selector({ values, value, onChange, label }: SelectorProps) {
    return <FormControl sx={{ m: 1, minWidth: 80 }}>
        <Autocomplete
            disablePortal
            value={value}
            onChange={(_, v) => onChange(v)}
            options={Object.keys(values)}
            sx={{ width: 300 }}
            getOptionLabel={v => values[v]}
            renderInput={(params) => <TextField {...params} label={label} />}
        />
    </FormControl>
}
