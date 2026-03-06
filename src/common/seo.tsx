import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Private Aviation Worldwide';
const BASE_URL = 'https://privateaircrafts.eu';
const DEFAULT_DESCRIPTION =
    'An open dataset tracking every private jet flight on the planet — models, registrations, routes, and emissions. Data since 2019.';
const DEFAULT_IMAGE = `${BASE_URL}/og.png`;

interface SEOProps {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
}

export default function SEO({ title, description = DEFAULT_DESCRIPTION, path = '/', image = DEFAULT_IMAGE }: SEOProps) {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const canonical = `${BASE_URL}${path}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={image} />

            {/* Twitter card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
