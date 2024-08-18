import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import WorldMap from "./map";

const text = `
This website quantifies private aviation worldwide. Here you can find:

* over 70 models of private aircrafts
* over 25 thousand of aircrafts by model, tail number, and country
* metrics of all flights since 2019 (over 30 million hours of flying time)
* Market share of private aircraft models by number of aircrafts, number of legs, distance flown, etc.
* Market share of private aircraft country of registration by number of aircrafts, number of legs, distance flown, etc.
`

export default function Home() {
    return <Box>
        <Typography component="div">
            <Markdown markdown={text} />
        </Typography>
        <WorldMap />
    </Box>
}
