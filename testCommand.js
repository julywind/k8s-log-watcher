const child_process = require('child_process');

module.exports.handler = (namespace)=> new Promise(((resolve, reject) => {
    child_process.exec(`kubectl get pods -n ${namespace}`,(err, stdout, stderr)=>{
        // console.log(err, stdout, stderr)
        if(err){
            reject(err)
        }else{
            resolve({stdout})
            console.log('stdout', stdout)
            console.log('stderr', stderr)
        }
    })
}))
