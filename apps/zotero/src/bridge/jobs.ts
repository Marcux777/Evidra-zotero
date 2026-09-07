import type { JobCommand } from './types';

export function jobCommand(message: JobCommand,
    request: (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>) {
    switch (message.op) {
        case 'jobs.list': return request('GET', `/jobs?offset=${message.offset}&limit=10`);
        case 'jobs.prepare': return request('POST', '/jobs', message.request);
        case 'jobs.read': return request('GET', `/jobs/${message.job_id}`);
        case 'jobs.access': return request('GET', `/jobs/${message.job_id}/access?offset=${message.offset ?? 0}&limit=50`);
        case 'jobs.units': return request('GET', `/jobs/${message.job_id}/units?offset=${message.offset}&limit=20`);
        case 'jobs.preview': return request('GET', `/jobs/${message.job_id}/units/${message.unit_id}/batches/${message.batch_index}`);
        case 'jobs.control': return request('POST', `/jobs/${message.job_id}/control`, message.request);
        case 'jobs.cache.clear': return request('POST', '/job-cache/clear');
    }
}
