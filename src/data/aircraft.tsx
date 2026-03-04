import { deserialize } from "../serde"
import { BASE_URL } from "./constants"

export interface Aircraft {
    readonly icao_number: string
    readonly tail_number: string
    readonly type_designator: string
    readonly model: string
    readonly country: string
};

function loadAircrafts(content: string): Aircraft[] {
    return deserialize(content, ["icao_number", "tail_number", "type_designator", "model", "country"]).map(x => x as Aircraft);
}

/**
 * Lists all available aircraft snapshot months from the bucket listing.
 * Returns a sorted array of "YYYY-MM" strings.
 */
export async function fetchAircraftMonths(): Promise<string[]> {
    const url = `${BASE_URL}?prefix=private_aircraft/v1/&delimiter=/`;
    const text = await fetch(url, { mode: 'cors' }).then(r => r.text());
    const xml = new DOMParser().parseFromString(text, "application/xml");
    return Array.from(xml.querySelectorAll("CommonPrefixes Prefix"))
        .map(node => node.textContent ?? "")
        .map(prefix => prefix.replace("private_aircraft/v1/month=", "").replace("/", ""))
        .filter(Boolean)
        .sort();
}

/**
 * Given a target "YYYY-MM" month and a sorted list of available months,
 * returns the latest available month that is <= the target.
 * Falls back to the earliest available month if none are prior.
 */
export function interpolateMonth(month: string, availableMonths: string[]): string {
    const filtered = availableMonths.filter(m => m <= month);
    const prior = filtered.length > 0 ? filtered[filtered.length - 1] : undefined;
    return prior ?? availableMonths[0];
}

export async function fetchAircrafts(month: string): Promise<Aircraft[]> {
    const url = `${BASE_URL}/private_aircraft/v1/month=${month}/data.csv`;
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAircrafts)
}
