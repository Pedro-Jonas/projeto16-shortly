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
        res.send({shortUlr}).status(201);
    } catch {
        res.sendStatus(500);
    };
};

async function getUrlsId (req, res){
    const id = req.params.id;
    try{
        const urls = await connection.query('SELECT id, "shortUrl", url FROM urls WHERE id = $1;',
        [id]);
        if (urls.rows.length === 0){
            res.sendStatus(404);
            return
        };
        res.send(urls.rows).status(200);
    } catch {
        res.sendStatus(500);
    }
};

async function getUrlsOpen (req, res){
    const shortUlr = req.params.shortUrl;
    try{
        const url = await connection.query('SELECT id, url, "visitCount" FROM urls WHERE "shortUrl" = $1;',
        [shortUlr]);
        if (url.rows.length === 0){
            res.sendStatus(404);
            return
        };
        const update = await connection.query('UPDATE urls SET "visitCount"=$1 WHERE id=$2;',
        [url.rows[0].visitCount + 1, url.rows[0].id]);
        res.redirect(url.rows[0].url);
    } catch {
        res.sendStatus(500);
    }
};

async function deleteUrl (req, res){
    const token = res.locals.token;
    const id = req.params.id;
    try{
        const session = await connection.query('SELECT "userId", token FROM sessions WHERE token = $1;',
        [token]);
        if (session.rows.length === 0){
            res.sendStatus(401);
            return
        };
        const url = await connection.query('SELECT "userId" FROM urls WHERE id = $1;',
        [id]);
        if (url.rows.length === 0){
            res.sendStatus(404);
            return
        };
        if ( url.rows[0].userId !== session.rows[0].userId){
            res.sendStatus(401);
            return
        };
        const deleteOne =  await connection.query('DELETE FROM urls WHERE id = $1;',
        [id]);
        res.sendStatus(204);
    } catch {
        res.sendStatus(500);
    };
};

async function getRanking(req, res){
    try{
        const ranking = await connection.query('SELECT users.id, users.name, COUNT(urls.*) AS "linksCount", SUM(urls."visitCount") AS "visitCount" FROM urls LEFT JOIN users ON urls."userId" = users.id GROUP BY users.id ORDER BY "visitCount" DESC LIMIT 10;');
        res.send(ranking.rows).status(200);
    } catch  {
        res.sendStatus(500);
    };
};


export { postUrlShoten, getUrlsId, getUrlsOpen, deleteUrl, getRanking };