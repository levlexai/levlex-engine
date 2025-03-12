import express, { Request, Response } from 'express';
import taskRoutes from './routes/tasks';
import inboundPhoneAgent from './routes/inboundPhoneAgent'
import outboundPhoneAgent from './routes/outboundPhoneAgent'
import { initTableManager } from './utils/tableManager';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use('/tasks', taskRoutes); // Add this line to mount the Task API routes

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});

app.use("/phone", inboundPhoneAgent);
app.use("/outbound", outboundPhoneAgent);


async function startServer() {
    // 1) Initialize the table manager *before* starting the server
    await initTableManager();
  
    // 2) Now that everything is ready, listen for incoming requests
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
  
  // 3) Kick everything off
  startServer().catch(err => {
    console.error("Error starting server:", err);
});