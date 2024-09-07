import { Router } from 'express'
import { PrismaClient } from '@repo/db';
import { userType, loginType } from 'common';

const user = Router();
const prisma = new PrismaClient();


user.post('/', async(req, res) => {
    const response = userType.safeParse(req.body);
    if(!response.success){
        res.send({payload: response.error.errors[0].message});
    }
    if(response.data === undefined){
        return res.send({payload: "Empty fields"});
    }

    const response2 = await prisma.user.create({
        data : {
            name: response.data?.name,
            agentId: response.data?.agentId,
            phoneNo: response.data?.phoneNo,
            password: response.data.password
        }
    })
    res.status(201).send({payload: `User created successfully with id ${response2.id}`});
})

user.get('/', async (req, res) => {
    const response = loginType.safeParse(req.body);
    if(!response.success){
        res.send({payload: response.error.errors[0].message});
    }
    if(response.data === undefined){
        return res.send({payload: "Empty fields"});
    }
    const response2 = await prisma.user.findFirst({
        where : {
            agentId: response.data.agentId,
            password: response.data.password
        }
    })
    if(response2 != null){
        return {result: true, payload: response2}
    } else {
        return {result: false, payload: null}
    }
})

export default user;