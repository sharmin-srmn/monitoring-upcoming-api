//MODULE SCAFFOLDING
const environments = {};

environments.staging = {
    port : 3000, 
    envName : 'staging',
    secretKey : 'hahgjdfgsdhgriushfkjsd'
}

environments.production = {
    port : 5000, 
    envName : 'production',
    secretKey : 'usfyiew658734ytlkdrsjyt85w'
}

//CURRENT ENVIROMNET
const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging'; 
const envToExport = typeof(environments[currentEnv]) === 'object' ? environments[currentEnv] : environments['staging'];

//EXPORT 
module.exports = envToExport;