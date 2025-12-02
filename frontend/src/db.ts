import { createDbWorker } from "sql.js-httpvfs";

const baseUrl = import.meta.env.BASE_URL;
const workerUrl = new URL(baseUrl + "sqlite.worker.js", import.meta.url);
const wasmUrl = new URL(baseUrl + "sql-wasm.wasm", import.meta.url);

let indexWorker: any = null;
let currentFormatWorker: { formatId: string; worker: any } | null = null;

export const getIndexDb = async () => {
  if (indexWorker) return indexWorker;

  indexWorker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full",
          url: baseUrl + "db.sqlite3",
          requestChunkSize: 4096,
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

  return indexWorker;
};

export const getFormatDb = async (formatId: string) => {
  if (currentFormatWorker && currentFormatWorker.formatId === formatId) {
    return currentFormatWorker.worker;
  }

  const worker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full",
          url: baseUrl + `dbs/${formatId}.sqlite3`,
          requestChunkSize: 4096,
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

  currentFormatWorker = { formatId, worker };
  return worker;
};
