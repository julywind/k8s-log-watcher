// 基于koa-websocket实现的即时通讯
// 把下面的这个几个模块安装一下
// 这只是功能模块完成，后期肯定要连接数据库保存数据
const Koa = require('koa')
// 路由
const wsRoute = require('koa-route')

const _static = require('koa-static');
const bodyParser = require('koa-bodyparser')
const parser = require('koa-parser')

// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
const app = websockify(new Koa())
const url = require("url")
const socketHandler = require('./handler/sockerHandler')
const appRoute = require('./routes')

app.use(async function (ctx, next) {
    return await next(ctx)
})

app.ws.use(function (ctx, next) {
    return next(ctx)
})

app.use(_static('www'))
app.use(parser({json: 'true'}))
app.use(appRoute.routes())
   .use(appRoute.allowedMethods())

app.ws.use(bodyParser())
app.ws.use(parser({json: 'true'}))
app.ws.use(wsRoute.all('/logs', async (ctx) => {
    const { ns, pod } = url.parse(ctx.request.ctx.originalUrl, true).query
    console.log('query',{ns, pod})
    if(!ns || !pod){
        ctx.websocket.send('invalid params: ns and pod')
        ctx.websocket.close()
        return
    }

    let cmd = 'kubectl'
    let params = ['logs', '--tail=20' ,'-f', pod,'-n', ns]
    if(process.platform === 'win32'){
        cmd = 'ping'
        params = ['www.baidu.com', '-t']
    }
    console.log('cmd', cmd, params.join(' '))
    socketHandler(cmd, params, ctx.websocket)
}))
const port = process.env.PROT || 3000
// 会默认打开127.0.0.1:8083这个端口号
app.listen(port, ()=>{
    console.log(`listing on port ${port}`)
})
