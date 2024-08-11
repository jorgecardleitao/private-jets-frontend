import { deserialize } from "../serde"


/*
CAST("start" AS DATE) AS "date",
COUNT(DISTINCT("tail_number")) AS "number_of_aircrafts",
COUNT(*) AS "number_of_legs",
SUM("duration") AS "time_flown",
SUM("co2_emissions")/1000/1000/1000 AS "co2_emitted",
SUM("distance")/1000/1000/1000 AS "km_flown",
SUM("great_circle_distance")/1000/1000/1000 AS "km_travelled",
*/
export interface Aggregate {
    readonly date: Date
    readonly number_of_aircrafts: number
    readonly number_of_legs: number
    readonly time_flown: number
    readonly co2_emitted: number
    readonly km_flown: number
    readonly km_travelled: number
};

export type Scale = "by_day" | "by_month" | "by_year"

function loadAggregates(content: string): Aggregate[] {
    return deserialize(content, ["date", "number_of_aircrafts", "number_of_legs", "time_flown", "co2_emitted", "km_flown", "km_travelled"]).map(x => x as Aggregate);
}

export async function fetchAggregates(scale: Scale): Promise<Aggregate[]> {
    const url = `https://private-jets.fra1.digitaloceanspaces.com/analysis/v1/${scale}.csv`
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAggregates)
}
