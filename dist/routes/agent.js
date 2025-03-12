// agent.ts
import express from "express";
import { agentMap } from "../utils/agentMap";
const router = express.Router();
/**
 * POST /agent
 * Body: AgentRouteBody
 * Orchestrates a pipeline of agent calls.
 */
router.post("/", async (req, res, next) => {
    try {
        const body = req.body;
        const { defaultModel, returnLastOnly = false, pipeline, } = body;
        // We'll store the results row by row
        // each row => an array of agent outputs
        const pipelineResults = [];
        // We'll keep a "context" object if you want references from previous row's outputs
        // For simplicity, we won't implement param referencing; we just do normal calls.
        // But you could store partial data here and inject it into subsequent rows.
        let context = {};
        // Execute each row in sequence
        for (let rowIndex = 0; rowIndex < pipeline.length; rowIndex++) {
            const row = pipeline[rowIndex];
            // We'll run all calls in this row in parallel
            const rowPromises = row.map(async (call) => {
                // 1) find the agent function
                const agentFn = agentMap[call.agent];
                if (!agentFn) {
                    throw new Error(`No agent function found for agent name '${call.agent}'`);
                }
                // 2) merge default model if call.params doesn't have model
                //    or handle whichever merges you want
                if (!call.params.model) {
                    call.params.model = defaultModel;
                }
                // 3) add context to the prompt
                call.params.prompt += `The context from the previous agent execution is: ${JSON.stringify(context)}`;
                // 4) run agent
                const output = await agentFn(call.params);
                return { agent: call.agent, output };
            });
            // Wait for all parallel calls to finish
            const rowOutputs = await Promise.all(rowPromises);
            // Store in pipelineResults
            pipelineResults.push(rowOutputs);
            // Update context with the current row's outputs
            context = rowOutputs.reduce((acc, { output }, index) => {
                if (typeof output === 'string') {
                    acc[`output${index}`] = output;
                }
                return acc;
            }, {});
        }
        // Decide which results to return
        if (returnLastOnly) {
            // The last row's outputs
            const lastRowOutputs = pipelineResults[pipelineResults.length - 1] || [];
            res.json(lastRowOutputs);
        }
        else {
            // Return entire array of row results
            res.json(pipelineResults);
        }
    }
    catch (error) {
        console.error("Error in /agent pipeline:", error);
        res.status(500).json({ error: String(error) });
    }
});
export default router;
