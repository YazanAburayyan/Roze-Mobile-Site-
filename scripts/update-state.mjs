import fs from 'node:fs';

/**
 * Maintenance helper for BUILD_STATE.json.
 * Usage: node scripts/update-state.mjs A1=done B1=done C2=in_progress
 */
const p = 'BUILD_STATE.json';
const state = JSON.parse(fs.readFileSync(p, 'utf8'));
const args = process.argv.slice(2);

for (const arg of args) {
  const [id, status] = arg.split('=');
  const task = state.tasks.find((t) => t.id === id);
  if (!task) {
    console.log('unknown task id:', id);
    continue;
  }
  task.status = status;
}

fs.writeFileSync(p, JSON.stringify(state, null, 2) + '\n');

const by = (s) => state.tasks.filter((t) => t.status === s).map((t) => t.id);
console.log('done       :', by('done').join(', ') || '(none)');
console.log('in_progress:', by('in_progress').join(', ') || '(none)');
console.log('pending    :', by('pending').join(', ') || '(none)');
console.log('blocked    :', by('blocked').join(', ') || '(none)');
