# Authorized local model test environment

The user authorized installing a local model service for integration validation on 2026-09-05. The root installed the official portable Ollama distribution and two public models. This authorization covers synthetic local integration tests; it does not authorize paid APIs, discovering credentials, or processing the personal Zotero library.

## Installation and ownership

- Ollama: **0.33.3**, official [Windows standalone distribution](https://docs.ollama.com/windows), [release](https://github.com/ollama/ollama/releases/tag/v0.33.3).
- Executable: `C:/p/evidra-zotero/.local/ollama/runtime-0.33.3/ollama.exe`.
- Endpoint: `http://127.0.0.1:11434`; initial owned PID **33648**. Recheck ownership/readiness before later runs; a PID is not permanent identity.
- Models: `C:/p/evidra-zotero/.local/ollama/models`, outside the Evidra release payload.
- Server environment: `OLLAMA_NO_CLOUD=1`, `OLLAMA_NOPRUNE=1`, `OLLAMA_HOST=127.0.0.1:11434`, `OLLAMA_KV_CACHE_TYPE=f16`, `OLLAMA_KEEP_ALIVE=1m`, the verified NVIDIA UUID in `CUDA_VISIBLE_DEVICES`, and `OLLAMA_VULKAN=0`.
- Root coordinates this service. Do not install another copy, restart an unknown process, or download another model without coordination. The portable install does not register a Windows service or login item. The saved startup script launches it hidden and refuses an occupied port.

Archive: 1,469,175,900 bytes, SHA-256 `52cb36a62e7e501f61514f60212dec7117b6c098811357585e02fffe32d2fcd7`, matching the release asset digest. Extracted executable SHA-256 `e4fe6bd835fe146659f5c969dccaff2e25a9de63d90ee204ca5d11b9034b0ca5`; unpacked payload 1,953,507,607 bytes. This installation is for development validation and is not bundled into the Evidra XPI or engine ZIP.

## Selected models

| Purpose | Exact model | Catalog digest | Size and precision |
|---|---|---|---|
| Generation | [qwen3:4b](https://ollama.com/library/qwen3:4b) | `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7` | 2,497,293,931 bytes; Q4_K_M |
| Embeddings | [qwen3-embedding:0.6b](https://ollama.com/library/qwen3-embedding:0.6b) | `ac6da0dfba84a81fdbfbaf330198c33cd77c4cdfc53e8bc50eb581914a15621d` | 639,150,858 bytes; Q8_0; 1,024 dimensions |

The installed models report no `remote_model` or `remote_host`. Model metadata and capabilities are saved from the actual server, not inferred solely from names. The embedding model also lists tools/thinking capabilities; that does not grant a generation capability or authorize tool execution.

## Executed smoke

At 2026-09-05 22:04 UTC, the root ran the actual `/api/chat` and `/api/embed` protocols against the installed service. A synthetic sentence produced the expected structured value `87.5`, unit `%`, and evidence identifier `SYN-1` in 31 streaming chunks. A three-text English/Portuguese embedding request returned a finite 3 × 1,024 matrix; vector norms differed from 1 by less than 0.000001. Both loaded models reported `size_vram == size`, confirming full GPU placement. This smoke establishes service/model operation; Evidra adapters, retrieval quality and native UI are separate gates.

Generation configuration: context 4,096; output cap 128; temperature 0; seed 7; thinking disabled explicitly; truncation disabled; no tools. Embeddings used the model's full output dimension and disabled truncation. One preload, one generation and one embedding request ran; no failed-call retry, alternate provider or automatic model repair was used. The 56.844-second cold smoke includes startup/loading and is not a product latency benchmark.

Hardware: Windows 11 Home x64, Ryzen 7 7700, 32 GB RAM, RTX 5060 Ti with 16,311 MiB VRAM, NVIDIA driver 591.86. Before model use, GPU memory was 2,344 MiB used and utilization 2%; no separate model/Python job was found. Ollama detected the supported CUDA compute 12.0 path. [Official GPU support](https://docs.ollama.com/gpu) covers this GPU. No accelerator fallback or precision change occurred during validation.

## Receipts and causal diagnostics

Files under `C:/p/evidra-zotero/.local/ollama/`:

- `preflight.json`, `installation-receipt.json`, `owned-process.json`, `server-receipt.json`, `models-receipt.json`, `live-smoke-receipt.json`.
- `server-stdout.log`, `server-stderr.log`, per-model `*-pull.jsonl` and `*-show.json`, exact smoke request/response JSON/JSONL.
- `install-portable.py`, `start-local.ps1`, `pull-models.py`, `smoke-local.py` retain the executed commands. Installer/pull/smoke scripts deliberately refuse existing output files rather than silently repeating their side effects.

Initial read-only nested PowerShell commands failed from outer-shell variable expansion; `initial-shell-failure.log` records causal excerpts. A saved `-File` script corrected that inspection before installation. The server warns that explicit GPU visibility can affect discovery; its following CUDA record confirms the requested GPU was discovered, so no environment unset/retry occurred. Three `.md` documentation URLs returned non-retryable web-tool errors and were not fetched by another path; the tagged official Go API types supplied the request schema instead.

Future tests must recheck the endpoint and exact model digest, record their own synthetic input and call ledger, and distinguish controlled protocol failures from these live-model results. LM Studio and paid provider smoke remain unverified.
