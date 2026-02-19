import Papa from "papaparse";

interface StreamParseOptions {
    onProgress?: (percent: number) => void;
}

interface StreamParseResult {
    rows: Record<string, string>[];
}

/**
 * PapaParse chunk mode wrapper for streaming large CSV files.
 * - File input: reads from disk in chunks with progress tracking
 * - string input: already in memory, parses directly (no progress)
 */
export function streamParseCSV(
    input: File | string,
    options?: StreamParseOptions
): Promise<StreamParseResult> {
    return new Promise((resolve, reject) => {
        const rows: Record<string, string>[] = [];

        if (typeof input === "string") {
            Papa.parse(input, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    options?.onProgress?.(100);
                    resolve({ rows: results.data as Record<string, string>[] });
                },
                error: (error: Error) => {
                    reject(error);
                },
            });
            return;
        }

        let bytesProcessed = 0;
        const fileSize = input.size;

        Papa.parse(input, {
            header: true,
            skipEmptyLines: true,
            chunk: (results) => {
                rows.push(...(results.data as Record<string, string>[]));
                bytesProcessed += results.meta.cursor - bytesProcessed;
                const percent = Math.min(
                    Math.round((results.meta.cursor / fileSize) * 100),
                    99
                );
                options?.onProgress?.(percent);
            },
            complete: () => {
                options?.onProgress?.(100);
                resolve({ rows });
            },
            error: (error: Error) => {
                reject(error);
            },
        });
    });
}
