import { getNotebook } from "../../utils/notebookManager";
export async function runGetNotebookAgent(request) {
    const { notebookID } = request;
    // Retrieve the notebook using your manager
    const notebook = getNotebook(notebookID);
    if (!notebook) {
        // If not found, either throw an error or handle it in some default way
        throw new Error(`Notebook with ID "${notebookID}" not found.`);
    }
    // Return the notebook object
    const response = {
        notebook,
    };
    return response;
}
