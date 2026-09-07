import type { NativeSourceItem, NativeZotero } from './native-types';
import type { Source } from './types';

export const TRANSLATORS = {
    bibtex: '9cb70025-a888-4a29-a210-93ec52da40d4',
    ris: '32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7',
    csl_json: 'bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7',
} as const;
export type BibliographyFormat = keyof typeof TRANSLATORS;

// Deliberately excludes abstractNote, extra, notes, annotations, tags, relations,
// local paths and every child. Inspect field IDs before reading their values.
const METADATA_FIELDS = new Set(['title', 'shortTitle', 'date', 'DOI', 'url', 'publicationTitle',
    'journalAbbreviation', 'volume', 'issue', 'pages', 'series', 'seriesTitle', 'seriesText',
    'seriesNumber', 'edition', 'publisher', 'place', 'ISBN', 'ISSN', 'language', 'bookTitle',
    'conferenceName', 'proceedingsTitle', 'university', 'thesisType', 'institution', 'reportType',
    'reportNumber', 'archive', 'archiveLocation', 'libraryCatalog', 'callNumber', 'numberOfVolumes',
    'numPages', 'accessDate']);

export async function nativeBibliography(api: NativeZotero, crypto: Crypto, profile: string,
    sources: Source[], format: BibliographyFormat, check: () => void) {
    if (!sources.length || sources.length > 100 || new Set(sources.map(s => s.id)).size !== sources.length)
        throw new Error('INVALID_BIBLIOGRAPHY_SELECTION');
    const originals: NativeSourceItem[] = [], projections: NativeSourceItem[] = [], identities: string[] = [];
    for (const source of sources) {
        check();
        if (source.identity.profile_instance_id !== profile || !api.Libraries.exists(source.identity.library_id)
            || api.Libraries.get(source.identity.library_id).archived) throw new Error('SCOPE_DENIED');
        const original = await api.Items.getByLibraryAndKeyAsync(source.identity.library_id, source.identity.item_key);
        check();
        if (!original || original.deleted || !original.isRegularItem() || original.libraryID !== source.identity.library_id
            || original.key !== source.identity.item_key || api.ItemTypes.getName(original.itemTypeID) !== source.item_type
            || `${original.version}:${original.getField('dateModified')}` !== source.version) throw new Error('SCOPE_STALE');
        const projection = new api.Item(source.item_type);
        projection.libraryID = original.libraryID;
        for (const field of original.getUsedFields()) {
            if (!METADATA_FIELDS.has(api.ItemFields.getName(field))) continue;
            check(); projection.setField(field, original.getField(field));
        }
        projection.setCreators(original.getCreators());
        // Never assign native ID/key or save the projection: that would make the native
        // getter load child content. The public itemDone callback repairs serialized
        // identity only after safe unsaved-item serialization, before translator output.
        if (projection.id || projection.key) throw new Error('BIBLIOGRAPHY_PROJECTION_IDENTIFIED');
        const uri = api.URI.getItemURI(original);
        if (!uri.endsWith(`/items/${original.key}`)) throw new Error('BIBLIOGRAPHY_IDENTITY_INVALID');
        originals.push(original); projections.push(projection); identities.push(uri);
    }
    check();
    const translation = new api.Translate.Export();
    const translators = await translation.getTranslators(); check();
    if (!translators.some(t => t.translatorID === TRANSLATORS[format])) throw new Error('NATIVE_TRANSLATOR_UNAVAILABLE');
    translation.setItems(projections);
    translation.setTranslator(TRANSLATORS[format]);
    translation.setDisplayOptions({ exportNotes: false, exportFileData: false, exportTags: false, includeAnnotations: false, exportCharset: 'UTF-8' });
    let index = 0, failure: unknown = null;
    translation.setHandler('error', (_translation, error) => { failure = error; });
    translation.setHandler('itemDone', (_translation, value) => {
        try {
            check();
            if (value === false) return; // Native nextItem signals exhaustion this way.
            if (!value || typeof value !== 'object') throw new Error('BIBLIOGRAPHY_SERIALIZATION_INVALID');
            const item = value as Record<string, unknown>, source = sources[index], original = originals[index];
            // The installed ItemGetter uses stable ascending-ID sort; all unsaved IDs
            // are false. Verify order and empty children before restoring real identity.
            if (!source || !original || item.title !== source.title || item.itemID && item.itemID !== false
                || Array.isArray(item.notes) && item.notes.length || Array.isArray(item.attachments) && item.attachments.length
                || item.abstractNote || item.note || item.extra) throw new Error('BIBLIOGRAPHY_PROJECTION_INVALID');
            item.itemID = original.id; item.key = original.key; item.uri = identities[index];
            item.notes = []; item.attachments = [];
            index++;
        } catch (error) { failure = error; }
    });
    try { await translation.translate(); }
    catch (error) { throw new Error('NATIVE_TRANSLATOR_FAILED', { cause: error }); }
    check();
    if (failure) throw new Error('NATIVE_TRANSLATOR_FAILED', { cause: failure });
    if (index !== sources.length || typeof translation.string !== 'string' || !translation.string.trim())
        throw new Error('NATIVE_TRANSLATOR_INCOMPLETE');
    const bytes = new TextEncoder().encode(translation.string);
    if (bytes.byteLength > 16 * 1024 * 1024) throw new Error('BIBLIOGRAPHY_TOO_LARGE');
    const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
    check();
    return { text: translation.string, bytes, sha256, translator_id: TRANSLATORS[format], identities };
}
