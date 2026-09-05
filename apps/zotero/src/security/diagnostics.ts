const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const choose = (value: unknown, allowed: readonly string[], otherwise = 'REDACTED') => typeof value === 'string' && allowed.includes(value) ? value : otherwise;
const codes = ['ACL_ERROR', 'INVALID_HANDSHAKE', 'UNSAFE_PATH', 'INVALID_RUNTIME', 'RESERVED_PORT', 'ENGINE_START_FAILED', 'ENGINE_START_TIMEOUT', 'ENGINE_EXITED', 'NATIVE_COMMAND_FAILED', 'NATIVE_COMMAND_TIMEOUT', 'OPERATION_FAILED', 'PROTOCOL_MISMATCH', 'INVALID_CONNECTION_RECEIPT', 'PAYLOAD_HASH_MISMATCH', 'PAYLOAD_CHANGED', 'START_CANCELLED', 'HEARTBEAT_FAILED'];
const operations = ['consume_handshake', 'serve_engine', 'protect_acl', 'validate_acl', 'startup', 'powershell.exe', 'WindowsPowerShell\\v1.0\\powershell.exe', 'whoami.exe', 'icacls.exe'];
const types = ['Error', 'TypeError', 'DOMException', 'EvidraError', 'CalledProcessError', 'ValidationError', 'OSError', 'PermissionError', 'FileNotFoundError', 'TimeoutExpired'];
const fields = ['protocol_version', 'profile_instance_id', 'session_token', 'data_dir', 'port', 'connection_path', '<unrecognized-field>'];
const numeric = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
function engineProjection(value: unknown) {
    const source = record(value);
    if (!Array.isArray(source.causes) || !operations.includes(String(source.operation)))
        return { operation: 'startup', causes: [], stderr_redacted: true };
    return { operation: choose(source.operation, operations), causes: source.causes.slice(0, 16).map(value => {
            const cause = record(value), result: Record<string, unknown> = { type: choose(cause.type, types, 'Error') };
            if (cause.code !== undefined)
                result.code = choose(cause.code, codes);
            if (cause.operation !== undefined)
                result.operation = choose(cause.operation, operations);
            for (const key of ['errno', 'winerror', 'returncode', 'timeout_seconds'])
                if (Object.hasOwn(cause, key))
                    result[key] = numeric(cause[key]);
            if (Array.isArray(cause.errors))
                result.errors = cause.errors.slice(0, 20).map(value => { const error = record(value); return { type: choose(error.type, ['extra_forbidden', 'value_error', 'literal_error', 'string_type', 'string_too_short', 'string_too_long', 'int_type', 'missing', 'json_invalid']), field: choose(error.field, fields, '<unrecognized-field>') }; });
            if (cause.acl) {
                const acl = record(cause.acl);
                result.acl = { reason: choose(acl.reason, ['ACL_OPERATION_FAILED', 'REPARSE_POINT', 'UNEXPECTED_OWNER', 'UNEXPECTED_PRINCIPAL', 'NO_PRIVATE_ACCESS']), exception_type: choose(acl.exception_type, ['System.Management.Automation.ItemNotFoundException', 'System.UnauthorizedAccessException', 'System.IO.IOException', 'System.Security.SecurityException']), category: choose(acl.category, ['ObjectNotFound', 'PermissionDenied', 'SecurityError', 'InvalidOperation', 'NotSpecified']), line: numeric(acl.line), hresult: numeric(acl.hresult) };
            }
            if (cause.stderr_redacted === true)
                result.stderr_redacted = true;
            return result;
        }) };
}
export function parseEngineDiagnostic(text: string): ReturnType<typeof engineProjection> { try {
    return engineProjection(JSON.parse(text));
}
catch {
    return { operation: 'startup', causes: [], stderr_redacted: true };
} }
export function nativeDiagnostic(error: unknown) {
    const causes: Record<string, unknown>[] = [];
    const visited = new Set<unknown>();
    let current = error;
    while (current && causes.length < 16 && !visited.has(current)) {
        visited.add(current);
        const source = record(current);
        const cause: Record<string, unknown> = { type: choose(source.name, types, 'Error') };
        if (source.message !== undefined)
            cause.code = choose(source.message, codes, 'OPERATION_FAILED');
        if (source.operation !== undefined)
            cause.operation = choose(source.operation, operations);
        if (source.reason !== undefined)
            cause.reason = choose(source.reason, ['UNSAFE_NATIVE_PATH', 'OUTPUT_REDACTED']);
        for (const key of ['exitCode', 'timeout_seconds'])
            if (Object.hasOwn(source, key))
                cause[key] = numeric(source[key]);
        if (source.diagnostic)
            cause.diagnostic = engineProjection(source.diagnostic);
        causes.push(cause);
        current = source.cause;
    }
    return { operation: 'native_bridge', causes };
}
