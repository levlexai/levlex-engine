import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { Notebook, NotebookPage } from "../interfaces";

/**
 * We'll store all notebooks in a single JSON file with a shape:
 * {
 *   "notebooks": [
 *     { "id": "notebook1", "title": "Notebook Title", "pages": [ ... ] },
 *     ...
 *   ]
 * }
 */
interface NotebookStoreData {
  notebooks: Notebook[];
}

let notebookDB: LowSync<NotebookStoreData> | null = null;

/**
 * The default data for new or empty notebooks DB
 */
const defaultNotebookData: NotebookStoreData = {
  notebooks: [],
};

/**
 * initNotebookManager:
 *  - In your server startup, call this to set up the lowdb instance.
 *  - If file is empty, sets the default data.
 */
export function initNotebookManager(filePath = "./data/notebooks.json") {
  if (!notebookDB) {
    const adapter = new JSONFileSync<NotebookStoreData>(filePath);
    notebookDB = new LowSync<NotebookStoreData>(adapter, defaultNotebookData);
    notebookDB.read();
    if (!notebookDB.data) {
      notebookDB.data = { notebooks: [] };
      notebookDB.write();
    }
  }
}

/**
 * createNotebook:
 *  - Creates a new notebook with the given id, title, and empty pages array
 *  - If a notebook with that id already exists, returns it instead
 */
export function createNotebook(id: string, title: string): Notebook {
  if (!notebookDB) {
    throw new Error("Notebook manager not initialized. Call initNotebookManager first.");
  }

  // Check if notebook with this id already exists
  const existing = notebookDB.data.notebooks.find((n) => n.id === id);
  if (existing) {
    return existing;
  }

  // Otherwise create
  const newNotebook: Notebook = {
    id,
    title,
    pages: [],
  };
  notebookDB.data.notebooks.push(newNotebook);
  notebookDB.write();
  return newNotebook;
}

/**
 * getNotebook:
 *  - Retrieve an existing notebook by id.
 *  - Returns undefined if not found.
 */
export function getNotebook(id: string): Notebook | undefined {
  if (!notebookDB) {
    throw new Error("Notebook manager not initialized.");
  }
  return notebookDB.data.notebooks.find((n) => n.id === id);
}

/**
 * getOrCreateNotebook:
 *  - If a notebook with the given id exists, return it.
 *    Otherwise, create it with the specified title.
 */
export function getOrCreateNotebook(id: string, title: string): Notebook {
  const existing = getNotebook(id);
  if (existing) return existing;
  return createNotebook(id, title);
}

/**
 * addPage:
 *  - Adds a new page to a notebook's pages array
 *  - The page must have a unique page id, title, and content.
 */
export function addPage(notebookId: string, page: NotebookPage): void {
  if (!notebookDB) {
    throw new Error("Notebook manager not initialized.");
  }
  const notebook = getNotebook(notebookId);
  if (!notebook) {
    throw new Error(`Notebook with id ${notebookId} does not exist.`);
  }

  // Optionally check if page with page.id already exists
  // e.g. if (notebook.pages.find(p => p.id === page.id)) ...

  notebook.pages.push(page);
  notebookDB.write();
}
