const {Pool} = require('pg');

const pool = new Pool({
    user:"postgres",
    host:"localhost",
   // database:"Project",
    password:"Anurag123#",
    max:20,
    idleTimeoutMillis:30000,
    
})
pool.connect((err,client,release) =>{
    if(err){
        console.log(err)
    }
    else{
        console.log("Sucessfully Connected to Database");
        release();
        
    }
})

module.exports={
    client:()=> pool.connect(),
    query:(text,params)=>pool.query(text,params),
    
}