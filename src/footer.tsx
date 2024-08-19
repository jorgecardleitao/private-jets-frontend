import { Box, Container, Grid, Typography } from "@mui/material";

export const Footer = () => {
    return <Box
        component="footer"
        sx={{
            width: "100%",
            height: "auto",
            paddingTop: "1rem",
            paddingBottom: "1rem",
            bgColor: "dark"
        }}
    >
        <Container maxWidth="lg">
            <Grid container direction="column" alignItems="center">
                <Grid item xs={12}>
                    <Typography color="textSecondary" variant="subtitle1">
                        © 2024 Jorge Leitão (<a href="https://www.linkedin.com/in/jorgecarleitao/">Linkedin</a>)
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography color="textSecondary" variant="subtitle1">
                        Data collected by <a href="https://www.adsbexchange.com/">ADSB exchange's community</a>
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    </Box>;
};

export default Footer;
