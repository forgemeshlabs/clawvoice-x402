# ClawVoice

AI voice and x402 wallet capabilities for OpenClaw agents.

ClawVoice by ForgeMesh Labs gives OpenClaw agents voice output, optional push-to-talk voice input, and a local Base USDC x402 wallet for paid agent calls.

Package name: `@forgemeshlabs/x402-agent-voice`

Commands: `clawvoice` or `x402-agent-voice`

Homepage: https://forgemesh.io

Feedback: clawdbotworker@gmail.com

## What It Does

- Text-to-speech for OpenClaw agents.
- Local, hosted, or hybrid voice modes.
- Optional push-to-talk speech-to-text on supported platforms.
- x402 payments for hosted ForgeMesh Voice fallback.
- Local Base USDC x402 wallet for paid agent calls.
- Spend caps, balance checks, and withdrawal for leftover USDC.
- Plug-and-play OpenClaw / ClawHub skill packaging.

Search terms: ClawVoice, OpenClaw Voice, OpenClaw Agent Voice, AI Voice, Agent Voice, x402 Voice, Wallet Voice, Voice Skill, OpenClaw Skill.

## Install

From the release tarball:

```bash
npm install -g ./forgemeshlabs-x402-agent-voice-0.3.7.tgz
```

Then run setup:

```bash
clawvoice init --mode hybrid --mic
```

Use hosted mode if you do not want local voice setup:

```bash
clawvoice init --mode hosted
```

The old command still works:

```bash
x402-agent-voice init --mode hybrid --mic
```

## What Setup Does

Setup asks how your agent should speak:

| Mode | Meaning |
|---|---|
| `local` | Free local voice after setup. The voice runtime runs on your machine. |
| `hosted` | No local voice install. Your agent pays ForgeMesh Voice per call through x402. |
| `hybrid` | Local first, hosted fallback. This is the recommended mode. |

Setup creates a unique local Base USDC wallet the first time it runs for a user profile. If `~/.x402-agent-voice/wallet.json` already exists, setup reuses that wallet instead of replacing it.

Each machine, container, or user profile gets its own wallet unless you deliberately copy the local wallet file. Do not share `wallet.json`, check it into git, paste it into chat, or upload it to support.

## Quick Commands

```bash
clawvoice voice-check
clawvoice wallet
clawvoice balance
clawvoice withdraw --to 0xYourWallet --amount all
clawvoice products
clawvoice speak "hello world"
```

`wallet` shows the public address, chain, token, and spend policy. It does not show the private key.

## Recover Leftover Funds

The agent wallet is meant to hold a small working balance. If there is leftover USDC, send it back to your main wallet:

```bash
clawvoice withdraw --to 0xYourWallet --amount all
```

You can also withdraw a specific USDC amount:

```bash
clawvoice withdraw --to 0xYourWallet --amount 1.25
```

Withdrawals send Base USDC from the local agent hot wallet. The command prints a summary first and asks for confirmation before broadcasting. Use `--yes` only for automation you trust.

Important: USDC transfers on Base require a small amount of Base ETH for gas. x402 payments usually do not require you to think about ETH, but a normal wallet-to-wallet USDC transfer does.

## Voice Input

Push-to-talk voice input is optional functionality.

```bash
clawvoice install-mic
clawvoice listen
clawvoice talk --agent "claude -p"
```

`listen` records from the microphone until you press Enter, then transcribes locally with faster-whisper.

`talk` runs a conversation loop:

```text
record your voice -> transcribe locally -> send words to your agent -> speak the reply
```

Wake word and always-on listening are not shipped yet.

## Platform Support

| Capability | macOS | Linux | Windows |
|---|---|---|---|
| Wallet creation | Supported | Supported | Supported |
| Hosted x402 voice | Supported | Supported | Supported |
| Local text-to-speech | Supported | Supported | Use WSL2 |
| Playback | Supported | Supported | Partial / WSL2 recommended |
| Push-to-talk voice input | Supported with FFmpeg + faster-whisper | Supported with FFmpeg + faster-whisper | WSL2 recommended |
| Wake word / always-on listening | Not shipped | Not shipped | Not shipped |

Windows users can use wallet and hosted voice flows. Native Windows microphone recording, local voice install, and playback still need a compatibility pass. Use WSL2 for the full local path.

## Spend Safety

Hosted voice and other paid x402 calls are guarded before any payment is signed.

Default policy:

| Setting | Default |
|---|---:|
| Per-call cap | `$0.05` |
| Daily cap | `$0.25` |
| Session voice cap | `$0.10` |
| Approval before paid calls | On |

Spend records are stored locally at:

```text
~/.x402-agent-voice/spend.jsonl
```

Configuration is stored locally at:

```text
~/.x402-agent-voice/config.json
```

## Local Voice

For local or hybrid mode:

```bash
clawvoice install-voice
```

To see what it would do first:

```bash
clawvoice install-voice --dry-run
```

Local voice may download Python packages and model files. Hosted mode avoids that setup and uses x402 payments instead.

## Built-In ForgeMesh Products

The package includes a starter list of ForgeMesh x402 products:

```bash
clawvoice products
```

AgentCash and X402Scan discovery can still be used for broader x402 discovery.

## Security Notes

- Treat the generated wallet as a small-balance hot wallet.
- Each fresh user profile gets a unique local wallet. Reinstalls reuse the existing local wallet unless you reset local state.
- Do not fund it with more than you are comfortable letting an agent spend.
- Do not share `~/.x402-agent-voice/wallet.json`; it contains the private key.
- Use `clawvoice withdraw --to 0xYourWallet --amount all` to recover leftover USDC.
- The private key stays on your machine.
- The private key is not printed by setup, `wallet`, `voice-check`, or normal commands.
- Paid calls require approval unless you explicitly pass `--approve`.

## Feedback

Please send feedback, bugs, and confusing setup steps to:

```text
clawdbotworker@gmail.com
```

Helpful details:

- OS and Node version.
- Setup mode: local, hosted, or hybrid.
- Whether `voice-check` reports local server, FFmpeg, and Whisper as ready.
- Whether `speak`, `listen`, and `talk` worked.
- Any payment approval prompt that felt unclear.
