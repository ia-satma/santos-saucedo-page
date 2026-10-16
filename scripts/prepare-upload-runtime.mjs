import { mkdir, writeFile, readdir, copyFile, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const output = path.resolve('dist/clamav');
const cache = path.resolve('.cache/clamav');
await mkdir(output, { recursive: true });
await mkdir(cache, { recursive: true });
const configuration = path.join(cache, 'freshclam.conf');
await writeFile(configuration, [
  `DatabaseDirectory ${cache}`,
  `DatabaseOwner ${os.userInfo().username}`,
  'DatabaseMirror database.clamav.net',
  'ConnectTimeout 15', 'ReceiveTimeout 90', 'MaxAttempts 2',
  'ScriptedUpdates yes', 'Checks 1', '',
].join('\n'));

function run(command, args, timeout = 180_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`${command} excedió el tiempo de preparación.`));
    }, timeout);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error(`${command} terminó con código ${code}.`));
    });
  });
}

console.log('[uploads] Comprobando FFmpeg y actualizando firmas oficiales de ClamAV.');
await run('ffprobe', ['-version'], 15_000);
await run('ffmpeg', ['-version'], 15_000);
await run('freshclam', [`--config-file=${configuration}`]);
const databases = (await readdir(cache)).filter(name => /\.(?:cvd|cld)$/.test(name));
if (!databases.length) throw new Error('No hay firmas oficiales de ClamAV.');
for (const name of databases) await copyFile(path.join(cache, name), path.join(output, name));
const probe = path.join(output, 'readiness.txt');
await writeFile(probe, 'Santos & Saucedo upload runtime readiness');
await run('clamscan', [`--database=${output}`, '--no-summary', probe], 60_000);
console.log('[uploads] Video y escáner listos. Firmas incluidas en el artefacto de despliegue.');
