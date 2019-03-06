const Router = require('koa-router')
const getPods = require('../libs/getPods')

const route = new Router()

route.all('/infos',async (ctx)=>{
    ctx.body = await getPods.handler()
})

module.exports = route
