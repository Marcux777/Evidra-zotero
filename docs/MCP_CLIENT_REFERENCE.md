# Official MCP client reference

Verified 2026-09-05 by read-only official-documentation research and installed CLI help/version checks. This is implementation input for Task 10, not an executed Evidra integration. No client was registered, authenticated or used for a model call, and no personal configuration was read or changed.

| Client | Observed local version | Official stdio configuration |
|---|---|---|
| Codex | 0.153.4 | TOML `[mcp_servers.<id>]`, `command`, `args`, `enabled`; [MCP guide](https://developers.openai.com/codex/mcp), [configuration reference](https://developers.openai.com/codex/config-reference). |
| Claude Code | 2.1.195 | `.mcp.json` uses `mcpServers.<id>` with `type: "stdio"`, `command`, `args`, optional `env`; local/user/project scopes are distinct; [MCP guide](https://code.claude.com/docs/en/mcp). |
| Gemini CLI | 0.41.2 | User or project `settings.json` uses `mcpServers.<id>` with `command`, `args`, optional `env`, `cwd`, `timeout`, `trust`; [MCP guide](https://geminicli.com/docs/tools/mcp-server/). |

Use only the actual selected executable and an Evidra-created private connection file. The examples below are schema examples with placeholder paths. The client configuration contains neither a credential nor a provider key. The configuration formats do not establish Windows file ACLs; Evidra must enforce that boundary.

Codex example:

```toml
[mcp_servers.evidra]
command = "C:\\Tools\\Evidra\\evidra-engine.exe"
args = ["mcp", "--connection-file", "C:\\Evidra-test\\connection.json"]
enabled = true
```

Claude Code example:

```json
{
  "mcpServers": {
    "evidra": {
      "type": "stdio",
      "command": "C:\\Tools\\Evidra\\evidra-engine.exe",
      "args": ["mcp", "--connection-file", "C:\\Evidra-test\\connection.json"]
    }
  }
}
```

Gemini CLI uses the same `mcpServers`/`command`/`args` shape, omitting `type`. Do not enable automatic trust in generated configuration. Merge a single named entry manually or show a concrete diff; never replace existing configuration. A selected file path in a support snippet should also be redacted if it identifies the user.

CLI help confirms `codex mcp add <NAME> -- <COMMAND>...`, `claude mcp add [options] <name> <commandOrUrl> [args...]`, and Gemini's `mcp add` command with project/user scope and stdio transport. Registration commands were not executed. The final setup documentation should favor the verified configuration shapes and test any generated command's argument handling before claiming it usable.

## Authentication and billing boundary

Codex subscription sign-in and API-key access are separate paths; API-key use does not consume included ChatGPT credits according to the [official authentication documentation](https://learn.chatgpt.com/docs/auth) and [pricing documentation](https://learn.chatgpt.com/docs/pricing). Evidra does not manage either login.

Claude Pro/Max limits are shared with Claude Code, while API/Console billing is separate. See [Claude Code with Pro/Max](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) and [API versus paid subscription](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console).

Gemini CLI documents Google-account subscription quotas separately from API-key and Vertex AI billing. See [CLI quota and pricing](https://geminicli.com/docs/resources/quota-and-pricing/), [authentication](https://geminicli.com/docs/get-started/authentication/) and [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing). No quota amount, price or universal subscription entitlement is assumed by Evidra.

The external client owns the conversation, authentication and any independent tools. Evidra controls only what its restricted MCP service returns. Subscription access is not embedded in Evidra's internal chat, which uses explicitly configured local runners or separately authorized API profiles.
