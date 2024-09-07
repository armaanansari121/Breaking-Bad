import { Router } from 'express'
import { createClient } from 'redis'
import { hashType, receiverType } from "common"

const trace = Router();

const client = createClient();
const client2 = createClient();

(async () => {
    await client.connect();
    await client2.connect();
})();

trace.post('/', async (req, res) => {
    const response = hashType.safeParse(req.body);
    if(!response.success){
        res.send({payload: response.error.errors[0].message});
    }
    const hash = response.data?.txHash;

    client2.subscribe(hash ?? '', (error) => {
        if (error) {
            console.error('Subscription error:', error);
            return res.status(500).send({ payload: 'Subscription error' });
        }
    });
    //@ts-ignore
    const endReceivers : Promise<receiverType> = await new Promise((res) => {
        client2.on('message', (message) => {
            client2.unsubscribe(hash);

            res(JSON.parse(message));
        })
    })

    await client.lPush("hash",JSON.stringify(hash));

    const receiver : receiverType = await endReceivers;

    res.send(receiver.payload)
})

export default trace;
