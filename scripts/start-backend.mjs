/**
 * Cross-platform backend starter for Windows (PowerShell) and Unix.
 * Finds the correct Python (venv first, then system), then starts Uvicorn.
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const BACKEND_DIR = join(ROOT, 'backend');

// Candidates: venv Python on Windows, venv Python on Unix, then system fallbacks
const PYTHON_CANDIDATES = [
  join(BACKEND_DIR, 'venv', 'Scripts', 'python.exe'),   // Windows venv
  join(BACKEND_DIR, 'venv', 'bin', 'python'),            // Unix venv
  join(BACKEND_DIR, 'venv', 'bin', 'python3'),           // Unix venv (python3)
  'python',    // system PATH
  'python3',   // system PATH (Linux/Mac)
];

function findPython() {
  for (const candidate of PYTHON_CANDIDATES) {
    if (candidate.includes(join('venv', ''))) {
      // For venv paths, check if file exists on disk
      if (existsSync(candidate)) {
        console.log(`[backend] Using Python: ${candidate}`);
        return candidate;
      }
    } else {
      // For PATH entries, just use them (will fail gracefully if missing)
      console.log(`[backend] Trying system Python: ${candidate}`);
      return candidate;
    }
  }
  return 'python'; // last resort
}

const pythonPath = findPython();

const args = [
  '-m', 'uvicorn', 'main:app',
  '--reload',
  '--reload-dir', BACKEND_DIR,
  '--port', '8000',
  '--host', '0.0.0.0',
];

console.log(`[backend] Starting: ${pythonPath} ${args.join(' ')}`);
console.log(`[backend] Working directory: ${BACKEND_DIR}`);

const proc = spawn(pythonPath, args, {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: false,
});

proc.on('error', (err) => {
  console.error(`[backend] Failed to start: ${err.message}`);
  console.error('[backend] Make sure you have Python and uvicorn installed in backend/venv');
  process.exit(1);
});

proc.on('exit', (code) => {
  if (code !== 0) {
    console.error(`[backend] Exited with code ${code}`);
  }
  process.exit(code ?? 0);
});

// Forward signals so Ctrl+C cleanly shuts down uvicorn
process.on('SIGINT', () => proc.kill('SIGINT'));
process.on('SIGTERM', () => proc.kill('SIGTERM'));
