import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import connection from './Database/connection.js';
import authRoutes from './Routes/auth.Routes.js';

dotenv.config();
const server = express();

server.use(json());
server.use(cors());


server.get("/users" , async (req, res) => {
    try{
        const users = await connection.query('SELECT * FROM users;');
        res.send(users.rows).status(200);
    } catch {
        res.sendStatus(422);
    }
});

server.use(authRoutes);


server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});