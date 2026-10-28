'use strict';
// Run with: rtk proxy node scripts/test-routing.cjs
// No browser, tile service or third-party test dependency is required.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const routing = require('../routing-engine.js');
const data = require('../routing-data.js');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/walking-pathways.geojson'), 'utf8'));
const R = 6371008.8, radians = Math.PI / 180, latitude = -34.93;
const point = (x, y) => [138.6 + x / (R * radians * Math.cos(latitude * radians)), latitude + y / (R * radians)];
const line = (id, from, to, coordinates, length, type = 'Footpath', speed = 1.39) => ({
  type: 'Feature', properties: {RouteID: id, FromNode: from, ToNode: to, Shape_Length: length, Speed: speed, Path_Type: type, Location: id},
  geometry: {type: 'LineString', coordinates}
});
const collection = features => ({type: 'FeatureCollection', features});
const close = (actual, expected, tolerance = 1e-5) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
const nearPoint = (actual, expected) => {close(actual[0], expected[0], 1e-9); close(actual[1], expected[1], 1e-9);};
const ids = result => result.segments.map(segment => segment.edgeId);
const failure = code => error => error instanceof Error && error.code === code && error.message.length > 10;

test('same-edge queries traverse only the requested portion and preserve interior vertices', async () => {
  const source = collection([line('bend', 1, 2, [point(0, 0), point(100, 0), point(100, 100)], 200)]);
  const before = JSON.stringify(source), engine = await routing.create(source);
  const result = await engine.calculate({start: point(50, 0), end: point(100, 50)});
  close(result.distance, 100, 0.002);
  assert.ok(result.distance > 0 && result.distance < 200);
  assert.equal(result.coords.length, 3);
  nearPoint(result.coords[0], point(50, 0)); nearPoint(result.coords[1], point(100, 0)); nearPoint(result.coords[2], point(100, 50));
  assert.deepEqual(ids(result), ['bend']);
  close(result.seconds, result.distance / 1.39 * (1.39 / (50 / 60)));
  const reverse = await engine.calculate({start: point(100, 50), end: point(50, 0)});
  close(reverse.distance, result.distance);
  for (let i = 0; i < result.coords.length; i++) nearPoint(reverse.coords[i], result.coords.at(-1 - i));
  assert.equal(JSON.stringify(source), before, 'query preparation must not mutate input');
  const again = await engine.calculate({start: point(50, 0), end: point(100, 50)});
  assert.deepEqual(again, result, 'temporary virtual nodes must not leak between queries');
});

test('multi-edge routes retain turns and sum real partial and complete edges', async () => {
  const engine = await routing.create(collection([
    line('horizontal', 1, 2, [point(0, 0), point(100, 0)], 100),
    line('vertical', 2, 3, [point(100, 0), point(100, 100)], 100),
    line('last', 3, 4, [point(100, 100), point(200, 100)], 100)
  ]));
  const result = await engine.calculate({start: point(25, 0), end: point(175, 100)});
  close(result.distance, 250, 0.002);
  assert.deepEqual(ids(result), ['horizontal', 'vertical', 'last']);
  assert.equal(result.coords.length, 4);
  nearPoint(result.coords[1], point(100, 0)); nearPoint(result.coords[2], point(100, 100));
  assert.ok(result.distance > 180, 'network route must not become the direct chord');
  close(result.segments.reduce((sum, segment) => sum + segment.distance, 0), result.distance);
});

test('profiles optimise their documented cost and provisional step-free excludes stairs and Esculator', async () => {
  for (const restrictedType of ['Stairs', 'Esculator']) {
    const engine = await routing.create(collection([
      line('direct', 1, 2, [point(0, 0), point(100, 0)], 100, restrictedType, 0.5),
      line('detour-a', 1, 3, [point(0, 0), point(50, 100)], 112, 'Footpath', 2),
      line('detour-b', 3, 2, [point(50, 100), point(100, 0)], 112, 'Ramp', 2)
    ]));
    const query = {start: point(0, 0), end: point(100, 0), pace: 50};
    const shortest = await engine.calculate({...query, profile: 'shortest'});
    const fastest = await engine.calculate({...query, profile: 'fastest'});
    const stepfree = await engine.calculate({...query, profile: 'stepfree'});
    close(shortest.distance, 100); close(fastest.distance, 224); close(stepfree.distance, 224);
    assert.deepEqual(ids(shortest), ['direct']);
    assert.deepEqual(ids(fastest), ['detour-a', 'detour-b']);
    assert.deepEqual(ids(stepfree), ['detour-a', 'detour-b']);
    assert.ok(fastest.seconds < shortest.seconds);
    const slow = await engine.calculate({...query, profile: 'fastest', pace: 35});
    close(slow.seconds / fastest.seconds, 50 / 35);
    assert.deepEqual(ids(slow), ids(fastest), 'pace changes ETA, not the selected fastest path');
  }
});

test('private, unofficial, proposed and timed paths never enter public routes', async () => {
  const excluded = ['Private Path', 'Unofficial Path', 'Street Crossing Proposed', 'Signalised Street Crossing Proposed', 'Split Signalised Street Crossing Proposed', 'Timed Path', 'Timed Underpass'];
  for (const type of excluded) {
    const engine = await routing.create(collection([
      line('closed', 1, 2, [point(0, 0), point(100, 0)], 100, type),
      line('public-a', 1, 3, [point(0, 0), point(50, 100)], 112),
      line('public-b', 3, 2, [point(50, 100), point(100, 0)], 112)
    ]));
    for (const profile of ['shortest', 'fastest', 'stepfree']) {
      const result = await engine.calculate({start: point(0, 0), end: point(100, 0), profile});
      assert.deepEqual(ids(result), ['public-a', 'public-b'], `${type}: ${profile}`);
      assert.equal(engine.stats.excludedCounts[profile][type], 1);
    }
  }
});

test('snaps use eligible segment interiors and enforce the visible 50 metre threshold', async () => {
  const engine = await routing.create(collection([line('only', 1, 2, [point(0, 0), point(100, 0)], 100)]));
  const within = await engine.calculate({start: point(25, 49), end: point(75, 49)});
  close(within.distance, 50, 0.002);
  close(within.snaps.start.distance, 49, 0.002); close(within.snaps.end.distance, 49, 0.002);
  nearPoint(within.snaps.start.coords, point(25, 0));
  await assert.rejects(engine.calculate({start: point(25, 51), end: point(75, 0)}), failure('OUTSIDE_COVERAGE'));
  await assert.rejects(engine.calculate({start: [0, 0], end: point(75, 0)}), failure('OUTSIDE_COVERAGE'));
  await assert.rejects(engine.calculate({start: [NaN, 0], end: point(75, 0)}), failure('INVALID_ENDPOINT'));
  // A geometrically nearer staircase is ineligible when snapping for step-free.
  const filtered = await routing.create(collection([
    line('stairs', 1, 2, [point(0, 0), point(100, 0)], 100, 'Stairs'),
    line('ramp', 3, 4, [point(0, 20), point(100, 20)], 100, 'Ramp')
  ]));
  const result = await filtered.calculate({start: point(25, 0), end: point(75, 0), profile: 'stepfree'});
  assert.equal(result.snaps.start.edgeId, 'ramp'); close(result.snaps.start.distance, 20, 0.002);
});

test('disconnected components, interior crossings and near endpoints remain disconnected', async () => {
  const fixtures = [
    [line('left', 1, 2, [point(0, 0), point(100, 0)], 100), line('right', 3, 4, [point(300, 0), point(400, 0)], 100)],
    [line('east-west', 1, 2, [point(-100, 0), point(100, 0)], 200), line('north-south', 3, 4, [point(0, -100), point(0, 100)], 200)],
    [line('almost-a', 1, 2, [point(0, 0), point(100, 0)], 100), line('almost-b', 3, 4, [point(100.1, 0), point(200, 0)], 99.9)]
  ];
  for (const features of fixtures) {
    const engine = await routing.create(collection(features));
    await assert.rejects(engine.calculate({start: features[0].geometry.coordinates[0], end: features[1].geometry.coordinates.at(-1)}), failure('DISCONNECTED'));
    assert.equal(engine.stats.componentCount, 2);
  }
});

test('endpoint fallback joins identical rounded endpoints but does not infer intersections', async () => {
  const features = [line('a', 1, 2, [point(0, 0), point(100, 0)], 100), line('b', 2, 3, [point(100, 0), point(100, 100)], 100)];
  for (const feature of features) {delete feature.properties.FromNode; delete feature.properties.ToNode;}
  const engine = await routing.create(collection(features));
  const result = await engine.calculate({start: point(0, 0), end: point(100, 100)});
  close(result.distance, 200); assert.equal(engine.stats.nodeCount, 3);
});

test('identical endpoints and cancellation return finite, explicit outcomes', async () => {
  const engine = await routing.create(collection([line('a', 1, 2, [point(0, 0), point(100, 0)], 100)]));
  const same = await engine.calculate({start: point(25, 0), end: point(25, 0)});
  close(same.distance, 0); close(same.seconds, 0); assert.equal(same.coords.length, 2);
  assert.ok(same.coords.flat().every(Number.isFinite));
  await assert.rejects(engine.calculate({start: point(0, 0), end: point(100, 0), cancelled: () => true}), failure('CANCELLED'));
  await assert.rejects(routing.create(data, {cancelled: () => true}), failure('CANCELLED'));
});

// This reference uses queue-based repeated relaxation rather than the engine's
// priority queue, and reads original source attributes rather than packed data.
function referenceDistances(features, startNode, profile) {
  const graph = new Map();
  const closed = new Set(['Private Path', 'Unofficial Path', 'Timed Path', 'Timed Underpass']);
  for (const feature of features) {
    const p = feature.properties, type = p.Path_Type;
    if (closed.has(type) || type.includes('Proposed') || (profile === 'stepfree' && ['Stairs', 'Esculator'].includes(type))) continue;
    const cost = p.Shape_Length / (profile === 'fastest' ? p.Speed : 1);
    for (const [from, to] of [[p.FromNode, p.ToNode], [p.ToNode, p.FromNode]]) {
      if (!graph.has(from)) graph.set(from, []);
      graph.get(from).push({to, cost});
    }
  }
  const distances = new Map([[startNode, 0]]), queue = [startNode], queued = new Set(queue);
  for (let head = 0; head < queue.length; head++) {
    const from = queue[head]; queued.delete(from);
    for (const {to, cost} of graph.get(from) || []) {
      const candidate = distances.get(from) + cost;
      if (candidate < (distances.get(to) ?? Infinity)) {
        distances.set(to, candidate);
        if (!queued.has(to)) {queue.push(to); queued.add(to);}
      }
    }
  }
  return distances;
}

test('supplied network matches the handoff baseline and independent representative costs', async t => {
  const engine = await routing.create(data);
  assert.equal(raw.features.length, 7280);
  assert.equal(engine.stats.edgeCount, 7280); assert.equal(engine.stats.nodeCount, 5168);
  assert.equal(engine.stats.componentCount, 14); assert.equal(engine.stats.largestComponentEdges, 7245);
  close(engine.stats.sourceLengthMetres, 396098.1861802475, 0.001);
  assert.equal(Object.keys(engine.stats.pathTypes).length, 35);
  const coordinates = new Map();
  for (const feature of raw.features) {
    coordinates.set(feature.properties.FromNode, feature.geometry.coordinates[0]);
    coordinates.set(feature.properties.ToNode, feature.geometry.coordinates.at(-1));
  }
  const start = raw.features.find(feature => feature.properties.Path_Type === 'Footpath').properties.FromNode;
  const profiles = ['shortest', 'fastest', 'stepfree'];
  const references = Object.fromEntries(profiles.map(profile => [profile, referenceDistances(raw.features, start, profile)]));
  const candidates = [...references.shortest].filter(([node, distance]) => distance > 500 && profiles.every(profile => references[profile].has(node)));
  assert.ok(candidates.length > 100, 'real network should supply representative connected endpoints');
  for (const targetMetres of [1000, 2500, 5000]) {
    const [end] = candidates.reduce((best, candidate) => Math.abs(candidate[1] - targetMetres) < Math.abs(best[1] - targetMetres) ? candidate : best);
    for (const profile of profiles) {
      const result = await engine.calculate({start: coordinates.get(start), end: coordinates.get(end), profile, pace: 50});
      const cost = profile === 'fastest' ? result.seconds / (1.39 / (50 / 60)) : result.distance;
      close(cost, references[profile].get(end), 0.05);
      assert.ok(result.coords.length > 2 && result.segments.length > 1);
      assert.ok(result.segments.every(segment => segment.pathType !== 'Private Path'));
      t.diagnostic(`${profile}: nodes ${start}→${end}, ${result.distance.toFixed(1)} m, ${(result.seconds / 60).toFixed(2)} min, ${result.segments.length} traversed edges`);
    }
  }
  const network = engine.networkGeoJSON(), original = network.features[0].geometry.coordinates[0][0];
  network.features[0].geometry.coordinates[0][0] = 0;
  assert.equal(engine.networkGeoJSON().features[0].geometry.coordinates[0][0], original, 'map geometry must not expose mutable permanent graph vertices');
});
