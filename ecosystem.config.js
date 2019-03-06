module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
        // First application
        {
            name      : 'log-shower',
            script    : 'app.js',
            instances : 'max',
            exec_mode : "cluster"
        }
    ]
};
