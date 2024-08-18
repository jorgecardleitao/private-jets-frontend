import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'preact/hooks';

export default function Home() {
    const [methodology, setMethodology] = useState<string>("");
    useEffect(() => {
        fetch("https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/methodology.md").then(v => v.text()).then(setMethodology)
    }, [])

    const markdown = methodology.replace(/\.\//g, "https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/")

    return <Typography component="div">
        <Markdown markdown={"(you can find more information on [github](https://github.com/jorgecardleitao/private-jets))"} />
        <Markdown markdown={markdown} />
    </Typography>
}
