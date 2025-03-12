import { dropTable } from "../../utils/tableManager";
export async function clearMemoryAgent(request) {
    const { brainID } = request;
    // Attempt to drop
    const success = await dropTable(brainID);
    return success;
}
