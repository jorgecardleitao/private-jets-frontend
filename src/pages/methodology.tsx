import Markdown from 'preact-markdown';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'preact/hooks';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Methodology({ path }: { path?: string } = {}) {
    const [methodology, setMethodology] = useState<string>("");
    useEffect(() => {
        fetch("https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/methodology.md").then(v => v.text()).then(setMethodology)
    }, [])

    const markdown = methodology.replace(/\.\//g, "https://raw.githubusercontent.com/jorgecardleitao/private-jets/main/")

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 3 }}>
                <MenuBookIcon sx={{ fontSize: 36, color: 'info.main' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        Methodology
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        How the data is collected, processed, and validated from ADS-B transponder signals
                    </Typography>
                </Box>
                <Chip
                    icon={<GitHubIcon />}
                    label="View on GitHub"
                    component="a"
                    href="https://github.com/jorgecardleitao/private-jets"
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    variant="outlined"
                />
            </Box>

            {/* Content */}
            <Paper variant="outlined" sx={{ p: 4, '& img': { maxWidth: '100%', height: 'auto' } }}>
                <Typography component="div">
                    <Markdown markdown={markdown} />
                </Typography>
            </Paper>
        </Container>
    );
}
