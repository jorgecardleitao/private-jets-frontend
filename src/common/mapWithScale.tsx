import Grid from "@mui/material/Grid";

import {
    ComposableMap,
} from "react-simple-maps";

import VerticalScale from "./verticalScale";

export default function MapWithScale({ children, height, colors }) {
    return <Grid container spacing={1}>
        <Grid item xs={11}>
            <ComposableMap height={height * 11 / 12 * 800 / 600}>
                {children}
            </ComposableMap >
        </Grid>
        <Grid item xs={1}>
            <VerticalScale colors={colors} height={920 * 1 / 12 * 800 / 600} />
        </Grid>
    </Grid >
}