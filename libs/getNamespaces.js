const child_process = require('child_process');

const InvalidNamespaces = ['', 'Name', 'kube-public', 'kube-system']
module.exports.handler = ()=> new Promise(((resolve, reject) => {
    child_process.exec(`kubectl get namespaces -o=custom-columns=Name:.metadata.name`,(err, stdout, stderr)=>{
        if(err){
            reject(err)
        }else if(stderr){
            reject(new Error(stderr))
        }else{
            const result = stdout.split('\n').filter((item)=>!InvalidNamespaces.includes(item))
            resolve(result.sort())
        }
    })
}))

