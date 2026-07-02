"use strict";

const paths = require("./paths");
const { ensureDir } = require("./fsutil");
const { MODES, defaultConfig, loadConfig, saveConfig } = require("./config");
const { ensureWallet } = require("./wallet");
const { isInteractive, askYesNo, askChoice } = require("./prompt");
const { installVoice } = require("./local-runtime");
const { speak } = require("./speak");

const MODE_CHOICES = [
  "Free local voice   — runs on your machine, free after setup",
  "Hosted voice       — no install, pays per call from your agent wallet",
  "Hybrid             — local first, hosted fallback (recommended)",
];

function parseFlags(args) {
  const flags = { mode: null, mic: null, yes: false, install: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--mode") flags.mode = args[++i];
    else if (a === "--mic") flags.mic = true;
    else if (a === "--no-mic") flags.mic = false;
    else if (a === "--yes" || a === "-y") flags.yes = true;
    else if (a === "--install") flags.install = true;
    else if (a === "--no-install") flags.install = false;
  }
  if (flags.mode && !MODES.includes(flags.mode)) {
    console.error(`Invalid --mode "${flags.mode}". Use: ${MODES.join(" | ")}`);
    process.exit(1);
  }
  return flags;
}

async function init(args) {
  const flags = parseFlags(args);
  const interactive = isInteractive() && !flags.yes;
  const existing = loadConfig() || {};

  console.log("Hello world! Thanks for using ClawVoice by ForgeMesh Labs.");
  console.log("Feedback and bugs: clawdbotworker@gmail.com\n");
  console.log("ClawVoice setup\n");

  let mode = flags.mode;
  if (!mode) {
    if (interactive) {
      const idx = await askChoice("How should your agent speak?", MODE_CHOICES, 2);
      mode = MODES[idx];
    } else {
      mode = existing.mode || "hybrid";
    }
  }

  let micEnabled = flags.mic;
  if (micEnabled === null) {
    if (interactive) {
      micEnabled = await askYesNo(
        "\nEnable mic support later (FFmpeg + Whisper, so you can talk to your agent)?",
        false,
      );
    } else {
      micEnabled = existing.mic?.enabled ?? false;
    }
  }

  ensureDir(paths.APP_DIR);
  ensureDir(paths.VOICE_DIR);

  // Wallet is always created, in every mode — it powers hosted voice and future paid agent tools.
  const { wallet, created } = await ensureWallet();
  const config = defaultConfig({ walletAddress: wallet.address, mode, micEnabled, existing });
  saveConfig(config);

  console.log(`\n✔ Setup saved (mode: ${mode}${micEnabled ? ", mic: enabled" : ""})`);
  console.log(`✔ Wallet ${created ? "created" : "found"} — your agent's payment address:\n`);
  console.log(`    ${wallet.address}\n`);
  console.log("  Copy this address and send it a small USDC balance on Base network.");
  console.log("  This wallet pays for hosted voice and other paid agent tools.");
  console.log("  The private key stays on this machine and is never shown or sent anywhere.\n");

  let localInstalled = false;
  if (mode !== "hosted") {
    let doInstall = flags.install;
    if (doInstall === null) {
      doInstall = interactive
        ? await askYesNo("Install the local voice engine now (downloads Python packages)?", true)
        : false;
    }
    if (doInstall) localInstalled = installVoice({ dryRun: false });
    else console.log("Skipping local voice install. Run later: clawvoice install-voice");
  }

  if (micEnabled) {
    console.log("\nMic support flagged on. When you're ready: clawvoice install-mic");
  }

  if (localInstalled) {
    console.log("\nTesting your agent's voice...");
    try {
      await speak("Hello world. ClawVoice is ready.", { approve: false });
    } catch (_) {
      console.log('Test skipped — try it yourself: clawvoice speak "hello"');
    }
  } else {
    console.log("\nNext steps:");
    if (mode !== "hosted") console.log("  1. clawvoice install-voice   (free local speech)");
    if (mode !== "local") console.log(`  ${mode !== "hosted" ? "2" : "1"}. Fund the wallet address above with USDC on Base`);
    console.log(`  Then: clawvoice speak "hello world"`);
  }
}

module.exports = { init };
