const child_process = require('child_process');

module.exports.handler = ()=> new Promise(((resolve, reject) => {
    const cmd = `kubectl get pods --all-namespaces -o=jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.items[*]}{.metadata.namespace}{"\\t"}{.items[*]}{.metadata.labels.ksyun-app}{"\\n"}{end}'`

    child_process.exec(cmd, (err, stdout,stderr)=>{
        if(err){
            reject(err)
        }else if(stderr){
            reject(new Error(stderr))
        }else{
            const pods = stdout.split('\n').map(line => {
                const items = line.split('\t')
                return {namespace:items[1], app: items[2], pod: items[0]}
            }).filter(item=> !!item.app)
            resolve(pods)
        }
    })
}))

// module.exports.handler().then(console.log)
