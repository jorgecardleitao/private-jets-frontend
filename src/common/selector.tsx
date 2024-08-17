import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface SelectorProps {
    values: { [name: string]: string }
    value: string
    onChange: (arg0: any) => void
    label: string
}

export default function Selector(props: SelectorProps) {
    return <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id={`${props.label}-label`}>{props.label}</InputLabel>
        <Select
            labelId={`${props.label}-label`}
            id={props.label}
            value={props.value}
            onChange={e => props.onChange((e.target as HTMLTextAreaElement).value)}
            autoWidth
            label="Option"
        >
            {
                Object.entries(props.values).map(([k, v]) => {
                    return <MenuItem value={k}>{v}</MenuItem>
                })
            }
        </Select>
    </FormControl>
}
