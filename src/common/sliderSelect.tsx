import InputLabel from "@mui/material/InputLabel"
import Slider from "@mui/material/Slider"

export interface SelectProps {
    values: Map<number, string>
    value: number
    onChange: (arg0: number) => void
    label: string
}

export default function SliderSelect(props: SelectProps) {
    return <>
        <InputLabel id={`${props.label}-label`}>{props.label}</InputLabel>
        <Slider
            aria-label={`${props.label}-label`}
            defaultValue={0}
            valueLabelDisplay="off"
            step={1}
            onChange={(_, v) => props.onChange(v as number)}
            marks={Array.from(props.values.entries()).map(([k, v]) => {
                return {
                    value: k,
                    label: v,
                }
            })}
            track={false}
            min={Math.min(...props.values.keys())}
            max={Math.max(...props.values.keys())}
        />
    </>
}
