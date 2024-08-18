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
export type Quantity = "number_of_aircrafts" | "number_of_legs" | "time_flown" | "co2_emitted" | "km_flown" | "km_travelled"

function loadAggregates(dimension: "model", content: string): ModelAggregate[]
function loadAggregates(dimension: "country", content: string): CountryAggregate[]
function loadAggregates(dimension: Dimension, content: string): ModelAggregate[] | CountryAggregate[]
function loadAggregates(dimension: Dimension, content: string): ModelAggregate[] | CountryAggregate[] {
    const generic = deserialize(content, [dimension, "date", ...Object.keys(quantities)]).map(x => {
        Object.keys(quantities).forEach(quantity => {
            x[quantity] = parseFloat(x[quantity])
        });
        return x
    })
    return dimension == "model" ? generic.map(x => x as ModelAggregate) : generic.map(x => x as CountryAggregate)
}

export async function fetchAggregates(dimension: "model", scale: Scale): Promise<ModelAggregate[]>
export async function fetchAggregates(dimension: "country", scale: Scale): Promise<CountryAggregate[]>
export async function fetchAggregates(dimension: Dimension, scale: Scale): Promise<ModelAggregate[] | CountryAggregate[]>
export async function fetchAggregates(dimension: Dimension, scale: Scale): Promise<ModelAggregate[] | CountryAggregate[]> {
    const url = `https://private-jets.fra1.digitaloceanspaces.com/analysis/v1/by_${dimension}_${scale}.csv`
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(content => loadAggregates(dimension, content))
}

export const quantities: { [name in Quantity]: string } = {
    "time_flown": "Time flown (hours)",
    "co2_emitted": "Emissions (kg CO2)",
    "number_of_aircrafts": "Registered aircrafts",
    "number_of_legs": "Legs",
    "km_flown": "Distance flown (km)",
    "km_travelled": "Distance travelled (km)",
}
