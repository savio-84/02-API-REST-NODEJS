import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import crypto from 'node:crypto';
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`${request.method} ${request.url}`)
  })
  app.get('/hello', async () => {
    // const transaction = await knex('transactions').insert({
    //   id: crypto.randomUUID(),
    //   title: 'Teste Transaction',
    //   amount: 1000,
    // }).returning('*');
  
    // const transactions = await knex('transactions')
    // .where('id', 'e32d388c-a48a-40a2-95bc-7a94f44bf84a')
    // .orWhere('amount', 1000)
    // .select('*')
    
    const transactions = await knex('transactions').select('*');
  
  
    return transactions;
  })

  app.post('/', async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    const { title, amount, type } = createTransactionBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return response.status(201).send();

  })

  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async (request, response) => {
    const { sessionId } = request.cookies;
    const transactions = await knex('transactions').select('*').where('session_id', sessionId)

    return response.status(200).send({transactions});
  })

  app.get('/:id',{
    preHandler: [checkSessionIdExists]
  }, async (request, response) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const transaction = await knex('transactions')
      .where({
        id,
        session_id: sessionId
      })
      .first();

    return response.status(200).send({
      transaction,
    })
  })


  app.get('/summary', {
    preHandler: [checkSessionIdExists]
  }, async (request) => {
    const { sessionId } = request.cookies; 
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first();
    return {
      summary
    }
  })
}