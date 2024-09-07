import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import traceRoute from './routes/trace'
import userRoutes from "./routes/userRoute"
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
// app.use('/pastTrace');
app.use('/trace', traceRoute);

const port = process.env.PORT ?? '';

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})


