// tableManager.ts
import * as lancedb from "@lancedb/lancedb";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

/**
 * Data shape in 'brainsMap.json' – we track which brainIDs exist as tables
 */
interface BrainMapData {
  brains: {
    [brainID: string]: boolean;
  };
}

/**
 * We'll keep a single LanceDB instance in 'globalDb' 
 * and a single LowSync for the map of brainIDs => table existence
 */
let globalDb: Awaited<ReturnType<typeof lancedb.connect>> | null = null;
let lowdb: LowSync<BrainMapData> | null = null;

/**
 * defaultData for the JSONFileSync constructor 
 */
const defaultData: BrainMapData = {
  brains: {},
};

/**
 * initTableManager:
 * - connect to LanceDB in './lancedb_data'
 * - init lowdb with 'brainsMap.json'
 * 
 * Call this once at server startup
 */
export async function initTableManager(): Promise<void> {
  if (!globalDb) {
    // Connect returns a Promise, so we store the resolved DB
    globalDb = await lancedb.connect("./lancedb_data");
  }
  if (!lowdb) {
    // Pass defaultData to JSONFileSync constructor 
    const adapter = new JSONFileSync<BrainMapData>("./data/brainsMap.json");
    lowdb = new LowSync<BrainMapData>(adapter, defaultData);

    // read from disk
    lowdb.read();

    // If file is empty, lowdb.data is null => set it to defaultData
    if (!lowdb.data) {
      lowdb.data = { brains: {} };
      lowdb.write();
    }
  }
}

/**
 * getTable:
 * - ensures table for 'brainID' exists 
 * - returns the LanceDB Table
 */
export async function getTable(brainID: string) {
  if (!globalDb || !lowdb) {
    throw new Error("Must call initTableManager() before getTable().");
  }

  // check if we've created a table for this brainID
  const hasTable = !!lowdb.data.brains[brainID];
  if (!hasTable) {
    // create empty table
    await globalDb.createTable(brainID, [], { mode: "overwrite" });
    lowdb.data.brains[brainID] = true;
    lowdb.write();
  }

  // now open table
  return await globalDb.openTable(brainID);
}

/**
 * dropTable: if the table (brainID) exists, drop it, remove record from lowdb, return true
 * otherwise return false
 */
export async function dropTable(brainID: string): Promise<boolean> {
  if (!globalDb || !lowdb) {
    throw new Error("Must call initTableManager() before dropTable().");
  }

  const hasTable = !!lowdb.data.brains[brainID];
  if (!hasTable) {
    return false;
  }

  // LanceDB has a .dropTable(...) method
  await globalDb.dropTable(brainID);

  // remove from lowdb
  delete lowdb.data.brains[brainID];
  lowdb.write();

  return true;
}