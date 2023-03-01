import fastify from 'fastify'
import { knex } from './database'
// import crypto from 'node:crypto'
import { env } from './env'

const app = fastify()

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

app
  .listen({
    port: env.PORT
  })
  .then(() => {
    console.log(`Server is running on port 3333`)
  })
