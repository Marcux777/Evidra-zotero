import type { MatrixCommand } from './types';

export function matrixCommand(message: MatrixCommand, request: (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>) {
    switch (message.op) {
        case 'matrix.forms': return request('GET', `/forms?offset=${message.offset}&limit=1`);
        case 'matrix.template': return request('GET', '/forms/template');
        case 'matrix.form.write': return request('POST', '/forms', message.request);
        case 'matrix.query': return request('POST', '/matrix/query', message.request);
        case 'matrix.proposals': return request('POST', '/matrix/proposals/query', message.request);
        case 'matrix.history': return request('POST', '/matrix/decisions/query', message.request);
        case 'matrix.propose': return request('POST', '/matrix/proposals', message.request);
        case 'matrix.decide': return request('POST', '/matrix/decisions', message.request);
        case 'matrix.preview': return request('POST', '/matrix/bulk-preview', message.request);
        case 'matrix.approve': return request('POST', '/matrix/bulk-approve', message.request);
    }
}
