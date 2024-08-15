import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'preact/hooks';

const text = `
# Private aircrafts

This website summarizes private aviation worldwide. You can find:

* over 70 models of private aircrafts
* over 25 thousand of aircrafts by model, tail number, and country
* metrics of all flights since 2019 (over 30 M of flying time)
`

export default function Home() {
    const [methodology, setMethodology] = useState<string>("");
    useEffect(() => {
        fetch("https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/methodology.md").then(v => v.text()).then(setMethodology)
    }, [])

    // https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/src/country.rs
    const bla = methodology.replace(/\.\//g, "https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/")

    return <Typography>
        <Markdown markdown={text} />
        <Markdown markdown={bla} />
    </Typography>
}
