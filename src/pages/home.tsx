import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';

const text = `
## Private aircrafts

This website summarizes private aviation worldwide. You can find:

* over 70 models of private aircrafts
* over 25 thousand of aircrafts by model, tail number, and country
* metrics of all flights since 2019 (over 30 M of flying time)
`

export default function Home() {
    return <Typography>
        <Markdown markdown={text} />
    </Typography>
}
