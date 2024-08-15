import { deserialize } from "../serde"

export interface Aggregate {
    readonly country: string
    readonly date: Date
    readonly number_of_aircrafts: number
    readonly number_of_legs: number
    readonly time_flown: number
    readonly co2_emitted: number
    readonly km_flown: number
    readonly km_travelled: number
};

export type Scale = "by_country_day" | "by_country_month" | "by_country_year"

function loadAggregates(content: string): Aggregate[] {
    return deserialize(content, ["country", "date", "number_of_aircrafts", "number_of_legs", "time_flown", "co2_emitted", "km_flown", "km_travelled"]).map(x => x as Aggregate);
}

export async function fetchAggregates(scale: Scale): Promise<Aggregate[]> {
    const url = `https://private-jets.fra1.digitaloceanspaces.com/analysis/v1/${scale}.csv`
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAggregates)
}
