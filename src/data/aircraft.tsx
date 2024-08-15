import { deserialize } from "../serde"

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

export async function fetchAircrafts(): Promise<Aircraft[]> {
    const url = "https://private-jets.fra1.digitaloceanspaces.com/private_aircraft/v1/month=2024-07/data.csv";
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAircrafts)
}
