import joi from "joi";
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
import connection from "../Database/connection.js";

const signupSchema = joi.object({
    name: joi.string().required().min(1).trim(),
    email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().required().min(1).trim(),
    confirmPassword: joi.any().equal(joi.ref('password'))
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
        )
        if (checkEmail){
            res.sendStatus(409);
            return
        };
        const insertUser = await connection.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [user.name, user.email, passwordHash]);
        res.sendStatus(201);
    } catch{
        res.sendStatus(422);
    };
};

export { postSignup };