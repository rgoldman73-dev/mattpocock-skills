#!/usr/bin/env node
// Generate real promoted-only files because plugin cache copies do not retain symlinks.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'plugins/mattpocock-skills');
const scratch = mkdtempSync(join(tmpdir(), 'mattpocock-plugin-'));
const claudeScratch = mkdtempSync(join(tmpdir(), 'mattpocock-claude-'));
const claudeTarget = join(root, 'plugins/mattpocock-skills-claude');
const plugin = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
const adapter = readFileSync(join(root, 'scripts/plugin-templates/codex-adapter.md'), 'utf8');
const json = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); };

function tree(path) {
  if (!existsSync(path)) return {};
  const result = {};
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink in distributable: ${file}`);
      if (entry.isDirectory()) walk(file);
      else result[relative(path, file)] = createHash('sha256').update(readFileSync(file)).update(String(statSync(file).mode & 0o111)).digest('hex');
    }
  }
  walk(path);
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

try {
  const promoted = ['engineering', 'productivity'].flatMap(bucket =>
    readdirSync(join(root, 'skills', bucket), { withFileTypes: true }).filter(e => e.isDirectory() && existsSync(join(root, 'skills', bucket, e.name, 'SKILL.md'))).map(e => `./skills/${bucket}/${e.name}`));
  if (JSON.stringify([...promoted].sort()) !== JSON.stringify([...plugin.skills].sort())) throw new Error('Claude manifest must select exactly the promoted skills');
  const names = new Set();
  for (const source of plugin.skills) {
    if (!/^\.\/skills\/(engineering|productivity)\/[a-z0-9-]+$/.test(source)) throw new Error(`Unexpected source ${source}`);
    const name = source.split('/').at(-1);
    if (names.has(name)) throw new Error(`Duplicate skill name ${name}`);
    names.add(name);
    const claudeOutput = join(claudeScratch, source);
    mkdirSync(dirname(claudeOutput), { recursive: true });
    cpSync(join(root, source), claudeOutput, { recursive: true, dereference: true });
    const output = join(scratch, 'skills', name);
    cpSync(join(root, source), output, { recursive: true, dereference: true });
    const skill = join(output, 'SKILL.md');
    let text = readFileSync(skill, 'utf8');
    const close = text.indexOf('\n---', 3);
    if (!text.startsWith('---\n') || close === -1) throw new Error(`Missing frontmatter ${name}`);
    const fmEnd = text.indexOf('\n', close + 1) + 1;
    const prefix = '\nBefore this workflow, read [Codex compatibility](../../references/codex-adapter.md). It maps upstream tool names to the capabilities available in this session.\n';
    text = text.slice(0, fmEnd) + prefix + text.slice(fmEnd);
    writeFileSync(skill, text);
    const ui = readFileSync(join(output, 'agents/openai.yaml'), 'utf8');
    if (text.includes('disable-model-invocation: true') !== /allow_implicit_invocation:\s*false/.test(ui)) throw new Error(`Invocation settings differ: ${name}`);
  }
  mkdirSync(join(scratch, 'references'), { recursive: true });
  writeFileSync(join(scratch, 'references/codex-adapter.md'), adapter);
  cpSync(join(root, 'LICENSE'), join(scratch, 'LICENSE'));
  cpSync(join(root, 'LICENSE'), join(claudeScratch, 'LICENSE'));
  json(join(claudeScratch, '.claude-plugin/plugin.json'), plugin);
  json(join(scratch, '.codex-plugin/plugin.json'), {
    ...plugin,
    repository: 'https://github.com/rgoldman73-dev/mattpocock-skills',
    skills: './skills/',
    interface: { displayName: 'Matt Pocock Skills', shortDescription: '27 promoted engineering and productivity workflows', category: 'Developer tools' },
  });
  json(join(scratch, 'UPSTREAM.json'), { repository: 'https://github.com/mattpocock/skills', commit: 'd81f3a183412e71a5b1e84ca21bc1a35eea03a60', author: 'Matt Pocock', license: 'MIT', skills: plugin.skills });
  writeFileSync(join(scratch, 'README.md'), '# Matt Pocock Skills for Codex\n\nGenerated from the upstream Claude plugin\'s exact promoted set. MIT license and author metadata are preserved. See the fork\'s PORTS.md for installation and regeneration.\n');
  if (process.argv.includes('--check')) {
    const generated = tree(scratch), current = tree(target);
    const changed = [...new Set([...Object.keys(generated), ...Object.keys(current)])].filter(key => generated[key] !== current[key]);
    if (changed.length) throw new Error(`Generated plugin differs at ${changed.join(', ')}; run npm run build-codex-plugin`);
    if (JSON.stringify(tree(claudeScratch)) !== JSON.stringify(tree(claudeTarget))) throw new Error('Generated Claude package differs; run npm run build-codex-plugin');
    console.log(`Codex plugin: ${names.size} promoted skills and all supporting resources verified`);
  } else {
    rmSync(target, { recursive: true, force: true });
    mkdirSync(dirname(target), { recursive: true });
    cpSync(scratch, target, { recursive: true });
    rmSync(claudeTarget, { recursive: true, force: true });
    cpSync(claudeScratch, claudeTarget, { recursive: true });
    console.log(`Built Codex plugin with ${names.size} promoted skills`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
  rmSync(claudeScratch, { recursive: true, force: true });
}
