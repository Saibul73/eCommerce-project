
// const mongoClient = require('mongodb').MongoClient
const mongoose =require('mongoose');
const databaseConnect= process.env.MONGO_CONNECT_ID


    mongoose.connect(databaseConnect,{useNewUrlParser:true,
    useUnifiedTopology:true
},(err)=>{
    if(err){
        console.log('connection err'+err)
    }
    else{
        console.log('connection established')
    }
});

