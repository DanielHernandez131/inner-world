import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import {
  choose,
  currentScene,
  reflect,
  scenes,
  isAdventureResponse,
} from '../src/features/adventure/model.ts';
import { repository } from '../src/shared/storage/repository.ts';

function session(id = 'synthetic-experience') {
  return {
    schemaVersion: 1,
    experienceId: id,
    createdAt: '2026-01-01T00:00:00Z',
    choices: [],
    reflection: null,
    response: {
      request_id: 'synthetic-request',
      experience_id: id,
      template_id: 'crossing-v1',
      usage: { input_tokens: 1000, output_tokens: 300 },
      personalization: {
        title: 'Un bosque ficticio',
        introduction: 'Una senda entre árboles.',
        clearing_detail: 'Un claro abierto.',
        shelter_detail: 'Un refugio tranquilo.',
        arrival_detail: 'Una torre abierta al paisaje.',
        reflection_question: '¿Algo de aquí conecta contigo?',
      },
    },
  };
}
function experience(id) {
  return {
    id,
    confirmedAt: '2026-01-01T00:00:00Z',
    draft: { synthetic: true },
    analysis: { summary: 'Experiencia ficticia.', emotions: [], fragments: [] },
  };
}

test('all authored branches reach the ending within four decisions without changing source emotions', () => {
  function walk(current) {
    const sceneId = currentScene(current);
    assert.ok(current.choices.length <= 4);
    if (sceneId === 'arrival') {
      const reflected = reflect(current, 'fiction_only');
      assert.equal(reflected.reflection, 'fiction_only');
      assert.equal(current.reflection, null);
      assert.equal('analysis' in reflected, false);
      return 1;
    }
    return scenes[sceneId].choices.reduce(
      (total, choice) => total + walk(choose(current, choice.id)),
      0,
    );
  }
  assert.equal(walk(session()), 10);
});
test('only valid local transitions are accepted; corrupted/future progress is preserved by rejection', () => {
  const initial = session();
  assert.throws(() => choose(initial, 'cross'));
  assert.throws(() => reflect(initial, 'connects'));
  assert.throws(() => currentScene({ ...initial, schemaVersion: 2 }));
  assert.throws(() =>
    currentScene({ ...initial, choices: [{ sceneId: 'arrival', choiceId: 'observe' }] }),
  );
  assert.throws(() => currentScene({ ...initial, experienceId: 'another-source' }));
  assert.deepEqual(initial.choices, []);
});
test('the UI rejects malformed personalization or responses for another experience', () => {
  const { response } = session();
  assert.equal(isAdventureResponse(response, response.experience_id), true);
  assert.equal(isAdventureResponse(response, 'another-source'), false);
  assert.equal(
    isAdventureResponse(
      { ...response, personalization: { ...response.personalization, title: '' } },
      response.experience_id,
    ),
    false,
  );
  assert.equal(
    isAdventureResponse(
      { ...response, usage: { input_tokens: -1, output_tokens: 1 } },
      response.experience_id,
    ),
    false,
  );
});
test('saved content and progress resume from IndexedDB and deletion removes the adventure with its source', async () => {
  const id = 'saved-adventure-test';
  const source = experience(id);
  const next = choose(session(id), 'company');
  await repository.confirmExperience(source);
  await repository.saveAdventure(id, next);
  await repository.saveAdventure(id, next);
  let records = await repository.listExperiences();
  const record = records.find((item) => item.id === id);
  assert.equal(records.filter((item) => item.id === id).length, 1);
  assert.deepEqual(record.analysis, source.analysis);
  assert.deepEqual(record.adventure.response, next.response);
  assert.equal(currentScene(record.adventure), 'shelter');
  await repository.deleteExperience(id);
  await assert.rejects(repository.saveAdventure(id, next));
  records = await repository.listExperiences();
  assert.equal(
    records.some((item) => item.id === id),
    false,
  );
});
test('failed writes do not advance stored progress; future session versions are not overwritten', async () => {
  const id = 'future-adventure-test';
  const original = { ...session(id), schemaVersion: 2 };
  await repository.confirmExperience({ ...experience(id), adventure: original });
  await assert.rejects(repository.saveAdventure(id, session(id)));
  const record = (await repository.listExperiences()).find((item) => item.id === id);
  assert.equal(record.adventure.schemaVersion, 2);
  await repository.deleteExperience(id);
});
