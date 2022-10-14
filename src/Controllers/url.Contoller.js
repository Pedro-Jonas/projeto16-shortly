import joi from "joi";
import { customAlphabet } from "nanoid";
import connection from '../Database/connection.js';

const urlShotenSchema = joi.object({
    url: joi.string().uri().required(),
});

const nanoid = customAlphabet('1234567890abcdef', 8)

async function postUrlShoten (req, res){
    const token = res.locals.token;
    const url = req.body;
    try{
        const validation = urlShotenSchema.validate(url);
        if (validation.error){
            res.sendStatus(422);
            return
        };
        const session = await connection.query('SELECT "userId", token FROM sessions WHERE token = $1;',
        [token]);
        if (session.rows.length === 0){
            res.sendStatus(401);
            return
        };
        const shortUlr = nanoid();
        const insertUser = await connection.query('INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);',
        [session.rows[0].userId, url.url , shortUlr]);
        res.send({shortUlr}).status(201)
    } catch {
        res.sendStatus(500)
    };
};

export { postUrlShoten };