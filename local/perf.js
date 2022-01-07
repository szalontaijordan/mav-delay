import fs from 'fs';

const data = Array.from(JSON.parse(fs.readFileSync('dump.json', 'utf8')));
data.sort((a, b) => a.call - b.call);
console.log(data.length);


const IDEAL = 10000;
const trains = {};

data.forEach(({ id, delay = -1 }) => {
    const ID = id; // `${id}-${line}`;
    if (!trains[ID]) {
        trains[ID] = { delays: [delay], id };
    } else {
        trains[ID].delays.push(delay);
    }
});

const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const avg = (arr) => arr.length === 0 ? 0 : sum(arr) / arr.length;
const max = (arr) => Math.max(...arr);
const min = (arr) => Math.min(...arr);
const normalize = (arr) => arr.map((x) => (x - x % 5) / 5)
const score = (arr) => {
    const normalized = normalize(arr);

    if (sum(normalized) === 0) {
        return IDEAL;
    }

    return sum(d(normalized));
};

const d = (arr) => {
    const dd = [];
    for (let i = 0; i < arr.length - 1; i++) {
        dd[i] = arr[i] - arr[i + 1];
    }
    dd.push(0);
    return dd;
}

Object.entries(trains).forEach(([key, value]) => {
    trains[key].avg = avg(value.delays);
    trains[key].min = min(value.delays);
    trains[key].max = max(value.delays);
    trains[key].range = Math.abs(value.min - value.max);

    trains[key].score = score(value.delays);
    // trains[key].delays = normalize(value.delays)
});


const sorted = Object.values(trains)
    .filter(train => train.score !== IDEAL)
    .sort((a, b) => {
        return b.score === a.score
            ? b.range - a.range
            : b.score - a.score;
    })

const toTrains = (train) => {
    return data.filter(entry => entry.id === train.id).sort((a, b) => a.call - b.call);
}

const best = sorted.slice(0, 5).map(toTrains);
const worst = sorted.reverse().slice(0, 5).map(toTrains);

const report = { best, worst };

fs.writeFileSync('report.json', JSON.stringify(report, null, 2));

