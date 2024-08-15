import { deserialize } from "../serde"

export interface Aggregate {
    readonly date: string
    readonly number_of_aircrafts: number
    readonly number_of_legs: number
    readonly time_flown: number
    readonly co2_emitted: number
    readonly km_flown: number
    readonly km_travelled: number
};

export interface ModelAggregate extends Aggregate {
    readonly model: string
    readonly date: string
    readonly number_of_aircrafts: number
    readonly number_of_legs: number
    readonly time_flown: number
    readonly co2_emitted: number
    readonly km_flown: number
    readonly km_travelled: number
};

export interface CountryAggregate extends Aggregate {
    readonly country: string
    readonly date: string
    readonly number_of_aircrafts: number
    readonly number_of_legs: number
    readonly time_flown: number
    readonly co2_emitted: number
    readonly km_flown: number
    readonly km_travelled: number
};

export type Scale = "day" | "month" | "year"
export type Dimension = "country" | "model"

function loadAggregates(dimension: "model", content: string): ModelAggregate[]
function loadAggregates(dimension: "country", content: string): CountryAggregate[]
function loadAggregates(dimension: Dimension, content: string): ModelAggregate[] | CountryAggregate[] {
    return deserialize(content, [dimension, "date", "number_of_aircrafts", "number_of_legs", "time_flown", "co2_emitted", "km_flown", "km_travelled"]).map(x => x as ModelAggregate);
}

export async function fetchAggregates(dimension: Dimension, scale: Scale): Promise<ModelAggregate[] | CountryAggregate[]> {
    const url = `https://private-jets.fra1.digitaloceanspaces.com/analysis/v1/by_${dimension}_${scale}.csv`
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(content => loadAggregates(dimension, content))
}

export const quantities = {
    "time_flown": "Time flown (hours)",
    "co2_emitted": "Emissions (kg CO2)",
    "number_of_aircrafts": "Number of aircrafts",
    "number_of_legs": "Number of legs",
    "km_travelled": "Distance travelled (km)",
}
