import express, { Request, Response } from 'express';
// import inboundPhoneAgent from './routes/inboundPhoneAgent'
// import outboundPhoneAgent from './routes/outboundPhoneAgent'
import AgentOrchestrator from './routes/agent'
import { initTableManager } from './utils/tableManager';
import { initNotebookManager } from './utils/notebookManager';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Add this line to enable JSON parsing in the request body

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from the Levlex Agent Engine!');
});

// app.use("/phone", inboundPhoneAgent);
// app.use("/outbound", outboundPhoneAgent);
app.use('/agent', AgentOrchestrator)


async function startServer() {
    // 1) Initialize the table manager *before* starting the server
    await initTableManager();
    initNotebookManager();
  
    // 2) Now that everything is ready, listen for incoming requests
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
  
  // 3) Kick everything off
  startServer().catch(err => {
    console.error("Error starting server:", err);
});