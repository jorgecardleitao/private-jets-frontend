import { deserialize } from "../serde"

export interface Source {
    url: string
    date: string
}

export interface AircraftModel {
    readonly model: string
    gph: number
    sources: Source[]
};

interface RawAircraftModel {
    model: string
    gph: number
    source: string
    date: string
};

function rawAircraftModelFromCSV(content: string): RawAircraftModel[] {
    return deserialize(content, ["model", "gph", "source", "date"]).map(x => {
        x["gph"] = parseInt(x["gph"])
        return x
    }).map(x => x as RawAircraftModel);
}

function loadAircraftModels(content: string): AircraftModel[] {
    const data = rawAircraftModelFromCSV(content);

    const aggre: Map<string, [AircraftModel, number]> = data.reduce(function (acc: Map<string, [AircraftModel, number]>, x) {
        if (acc.has(x.model)) {
            let entry = acc.get(x.model)
            entry[0].gph += x.gph
            entry[0].sources.push({
                url: x.source,
                date: x.date,
            })
            entry[1] += 1
            acc.set(x.model, entry)
        } else {
            acc.set(x.model, [{
                model: x.model,
                gph: x.gph,
                sources: [{
                    url: x.source,
                    date: x.date,
                }]
            }, 1])
        }

        return acc;
    }, new Map);

    return Array.from(aggre
        .entries()).map(([key, value]) => {
            value[0].gph /= value[1];
            return value[0]
        })
}

export async function fetchAircraftModels(): Promise<AircraftModel[]> {
    const url = "https://private-jets.fra1.digitaloceanspaces.com/model/db/data.csv";
    return fetch(url, { mode: 'cors' }).then(response => response.text()).then(loadAircraftModels)
}
