import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const text = `
# Private aircrafts

This website quantifies private aviation worldwide. Here you can find:

* over 70 models of private aircrafts
* over 25 thousand of aircrafts by model, tail number, and country
* metrics of all flights since 2019 (over 30 M of flying time)
* Market share of private aircraft models by number of aircrafts, number of legs, distance flown, etc.
* Market share of private aircraft country of registration by number of aircrafts, number of legs, distance flown, etc.
`

export default function Home() {
    return <Box>
        <Typography>
            <Markdown markdown={text} />
        </Typography>
        <Box
            component="img"
            sx={{
                maxHeight: { xs: 233, md: 512 },
            }}
            alt="A private jet"
            src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Hawker_Beechcraft_850XP%2C_Private_JP7325778.jpg"
        />
    </Box>
}
