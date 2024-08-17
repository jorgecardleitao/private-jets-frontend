import InputLabel from "@mui/material/InputLabel"
import Slider from "@mui/material/Slider"

export interface SelectProps {
    values: Map<number, string>
    value: number
    onChange: (arg0: number) => void
    label: string
    marksEvery?: number
}

export default function SliderSelect(props: SelectProps) {
    const every = props.marksEvery ?? 1;
    return <>
        <InputLabel id={`${props.label}-label`}>{props.label}</InputLabel>
        <Slider
            aria-label={`${props.label}-label`}
            defaultValue={0}
            valueLabelDisplay="off"
            step={1}
            onChange={(_, v) => props.onChange(v as number)}
            marks={Array.from(props.values.entries()).filter((_, index) => index % every == 0).map(([k, v]) => {
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
