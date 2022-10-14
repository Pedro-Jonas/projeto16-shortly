import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import connection from './Database/connection.js';
import authRoutes from './Routes/auth.Routes.js';
import urlRoutes from './Routes/url.Routes.js';

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

server.get("/urls" , async (req, res) => {
    try{
        const urls = await connection.query('SELECT * FROM urls;');
        res.send(urls.rows).status(200);
    } catch {
        res.sendStatus(422);
    }
});

server.get("/sessions" , async (req, res) => {
    try{
        const sessions = await connection.query('SELECT * FROM sessions;');
        res.send(sessions.rows).status(200);
    } catch {
        res.sendStatus(422);
    }
});

server.use(authRoutes);
server.use(urlRoutes);


server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});