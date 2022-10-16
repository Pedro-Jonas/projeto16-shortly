import joi from "joi";
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
import connection from '../Database/connection.js';

const signupSchema = joi.object({
    name: joi.string().required().min(1).trim(),
    email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().required().min(1).trim(),
    confirmPassword: joi.any().equal(joi.ref('password'))
});

const signinSchema = joi.object({
    email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().required().min(1).trim()
});

async function postSignup (req, res){
    const user = req.body;
    const passwordHash = bcrypt.hashSync(user.password, 10);
    try{
        const validation = signupSchema.validate(user);
        if (validation.error){
            res.sendStatus(422);
            return
        };
        const emails = await connection.query('SELECT email FROM users;');
        const checkEmail = emails.rows.find(element => 
            element.email === user.email
        );
        if (checkEmail){
            res.sendStatus(409);
            return
        };
        const insertUser = await connection.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3);',
        [user.name, user.email, passwordHash]);
        res.sendStatus(201);
    } catch{
        res.sendStatus(500);
    };
};

async function postSignin (req, res) {
    const user = req.body;
    try{
        const validation = signinSchema.validate(user);
        if (validation.error){
            res.sendStatus(422);
            return
        };
        const users = await connection.query('SELECT id, email, password FROM users;');
        const checkuser = users.rows.find(element => 
            element.email === user.email
        );
        if (!checkuser){
            res.sendStatus(401);
            return
        };
        const validatePassword = bcrypt.compareSync(user.password, checkuser.password);
        if (!validatePassword){
            res.sendStatus(401);
            return
        };
        const token = uuid();
        const insertsession = await connection.query('INSERT INTO sessions ("userId", token) VALUES ($1, $2)',
        [checkuser.id, token]);
        res.send({token}).status(200);
    } catch {
        res.sendStatus(500);
    }
};

async function getRanking(req, res){
    try{
        const dados = await connection.query('SELECT * FROM users LEFT JOIN urls ON user.id = urls."userId" ;')
        console.log(dados)
        res.sendStatus(200);
    } catch  {
        res.sendStatus(500);
    };
};

export { postSignup, postSignin, getRanking };