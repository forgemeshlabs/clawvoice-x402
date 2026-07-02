"use strict";

const { spawnSync } = require("child_process");

// onnxruntime (Supertonic) and faster-whisper only ship wheels for CPython 3.9-3.12.
const MIN_MINOR = 9;
const MAX_MINOR = 12;

function versionOf(bin) {
  const result = spawnSync(bin, ["-c", "import sys; print('%d.%d' % sys.version_info[:2])"], {
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout) return null;
  const [major, minor] = result.stdout.trim().split(".").map(Number);
  if (!Number.isInteger(major) || !Number.isInteger(minor)) return null;
  return { major, minor };
}

function compatible(v) {
  return v !== null && v.major === 3 && v.minor >= MIN_MINOR && v.minor <= MAX_MINOR;
}

// Returns the first Python binary usable for the voice venv, or null (after
// printing guidance). X402_VOICE_PYTHON overrides probing.
function findPython() {
  const override = process.env.X402_VOICE_PYTHON;
  if (override) {
    const v = versionOf(override);
    if (compatible(v)) return override;
    console.error(
      `X402_VOICE_PYTHON=${override} is ${v ? `Python ${v.major}.${v.minor}` : "not runnable"}; ` +
        `need Python 3.${MIN_MINOR}-3.${MAX_MINOR}.`,
    );
    return null;
  }
  for (const bin of ["python3.12", "python3.11", "python3.10", "python3"]) {
    if (compatible(versionOf(bin))) return bin;
  }
  const v = versionOf("python3");
  if (v) {
    console.error(
      `python3 is Python ${v.major}.${v.minor}, but the local voice runtime needs ` +
        `Python 3.${MIN_MINOR}-3.${MAX_MINOR} (onnxruntime has no wheels for newer versions).`,
    );
  } else {
    console.error("python3 not found.");
  }
  console.error("Install Python 3.12 (brew install python@3.12, or the python.org installer),");
  console.error("or set X402_VOICE_PYTHON to a compatible interpreter, then rerun this command.");
  return null;
}

module.exports = { findPython };
