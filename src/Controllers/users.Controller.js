import connection from "../Database/connection.js";

async function getUser (req, res){
    const token = res.locals.token;
    try {
        const session = await connection.query('SELECT "userId", token FROM sessions WHERE token = $1;',
        [token]);
        if (session.rows.length === 0){
            res.sendStatus(401);
            return
        };
        const user = await connection.query('SELECT id, name FROM users WHERE id = $1;',
        [session.rows[0].userId]);
        if (user.rows.length === 0){
            res.sendStatus(404);
            return
        };
        const url = await connection.query('SELECT id, "shortUrl", url, "visitCount" FROM urls WHERE "userId" = $1;',
        [session.rows[0].userId]);
        const visitCount = await connection.query('SELECT SUM("visitCount") FROM urls WHERE "userId" = $1;',
        [session.rows[0].userId]);
        const objectUser = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            visitCount: visitCount.rows[0].sum,
            shortenedUrls: url.rows,
        };
        res.send(objectUser).status(200);
    } catch {
        res.sendStatus(500);
    };
};

export { getUser };