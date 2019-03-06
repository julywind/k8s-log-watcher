const spawn = require('child_process').spawn
const iconv = require('iconv-lite')

const prefix = String.fromCharCode(0x1b, 0x5b)
const Sep = String.fromCharCode(0x1b)
function strToHexCharCode(str) {
    if(str === "")
        return "";
    let val = "";
    for (let i = 0; i < str.length; i++) {
        val += ('00'+str.charCodeAt(i).toString(16)).substr(-2);
    }
    return val
}
function hexCharCodeToStr(hex) {
    let arr = hex.split("")
    let out = ""
    for (let i = 0; i < arr.length / 2; i++) {
        let tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
        let charValue = String.fromCharCode(tmp);
        out += charValue
    }
    return out
}
const sendMsg = (websocket, message) => {
    try{
        websocket.send(message)
    }catch (e) {
        console.log(e)
    }
}
module.exports = (cmd, params, websocket) => {
    console.log('process.pid', process.pid)

    const childProcess = spawn(cmd, params, {encoding: process.platform === 'win32'?'buffer':'utf8'})

    // 捕获标准输出并将其打印到控制台
    childProcess.stdout.on('data', function (message) {
        if(process.platform === 'win32'){
            message = iconv.decode(message, 'cp936')
        }else{
            message = message.toString()
        }

        console.log('recv msg', message)
        // console.log('recv msg2', strToHexCharCode(message))

        if(message.indexOf(prefix)===0){
            const lines = message.split('\n')
            message = lines.map(line => line.substr(5).split(Sep)[0]).join('\n')
        }

        // 返回给前端的数据
        try{
            sendMsg(websocket, message)
        }catch (e) {
            console.log(e)
        }
    });

    // 捕获标准错误输出并将其打印到控制台
    childProcess.stderr.on('data', function (message) {
        console.log('error', message)
        sendMsg(websocket, 'error:' + message)
    });

// 注册子进程关闭事件
    childProcess.on('exit', function (code, signal) {
        console.log('SubProcess exited，code:', code)
        // websocket.send('error:'+code+' signal:'+signal)
    });

    function closeChildProcess() {
        console.log('child.pid', childProcess.pid)
        childProcess.kill()
    }

    websocket.on('message', function (message) {
        // 返回给前端的数据
        console.log('recv msg', message)
        sendMsg(websocket, message)
    })
    websocket.on('close', function () {
        // 返回给前端的数据
        console.log('recv close')
        closeChildProcess()
    })
}