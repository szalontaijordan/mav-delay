import fetch from 'node-fetch';

const URL = 'http://vonatinfo.mav-start.hu/map.aspx/getData';
const method = 'post';
const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
const body = JSON.stringify({
    "a": "TRAINS",
    "jo": {
        "history": false,
        "id": false
    }
});

async function getTrains() {
    const response = await fetch(URL, {
        method,
        body,
        headers
    });
    const { d } = await response.json();

    return (d?.result?.['Trains']?.['Train'] || [])
        .map((train) => {
            return {
                delay: train['@Delay'],
                lat: train['@Lat'],
                lon: train['@Lon'],
                type: train['@Menetvonal'],
                line: train['@Line'],
                relation: train['@Relation']
            };
        })
        .filter(train => train.type === 'MAV');
}

function toCSV(trains) {
    const header = Object.keys(trains[0]);

    const csv = [];
    csv.push(header.join(','));
    trains.forEach(train => {
        const line = header.map(key => train[key]).join(',');
        csv.push(line);
    });

    return csv.join('\n');
}

export default async function handler(req, res) {
    const trains = await getTrains();

    if (req?.query?.type === 'csv') {
        res.send(toCSV(trains));
    } else {
        res.send(trains);
    }
}
