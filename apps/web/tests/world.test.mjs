import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRegion } from '../src/features/world/buildWorld.ts';

const record = (id, emotion = 'fear') => ({
  id,
  confirmedAt: '2026-01-01T00:00:00Z',
  analysis: { emotions: [{ emotion, intensity: 6 }] },
});
test('stable slots retain every source and cap visible traces per region', () => {
  const items = ['d', 'a', 'c', 'b'].map((id) => record(id));
  const result = buildRegion(items, 'fear');
  assert.deepEqual(
    result.visible.map((item) => item.id),
    ['a', 'b', 'c'],
  );
  assert.equal(result.records.length, 4);
  assert.equal(result.overflow, 1);
  assert.deepEqual(buildRegion([...items].reverse(), 'fear'), result);
  assert.deepEqual(
    items.map((item) => item.id),
    ['d', 'a', 'c', 'b'],
  );
});
test('deletion reconstructs the map and never borrows other emotions', () => {
  const items = [record('a'), record('b', 'joy')];
  assert.equal(buildRegion(items, 'fear').visible.length, 1);
  assert.equal(
    buildRegion(
      items.filter((item) => item.id !== 'a'),
      'fear',
    ).visible.length,
    0,
  );
  assert.equal(buildRegion(items, 'joy').visible[0].id, 'b');
});
