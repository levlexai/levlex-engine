import express, { Request, Response } from 'express';
import taskRoutes from './routes/tasks';
import inboundPhoneAgent from './routes/inboundPhoneAgent'
import outboundPhoneAgent from './routes/outboundPhoneAgent'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use('/tasks', taskRoutes); // Add this line to mount the Task API routes

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript Express!');
});

app.use("/phone", inboundPhoneAgent);
app.use("/outbound", outboundPhoneAgent);

  
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});