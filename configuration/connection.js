
// const mongoClient = require('mongodb').MongoClient
const mongoose =require('mongoose');



    mongoose.connect("mongodb+srv://saibul:Valapil1@urbanbull.bj4exsb.mongodb.net/urbanbull",{useNewUrlParser:true,
    useUnifiedTopology:true
},(err)=>{
    if(err){
        console.log('connection err'+err)
    }
    else{
        console.log('connection established')
    }
});

// mongoose.connect("mongodb://localhost:27017/eCommerce",{useNewUrlParser:true,
// useUnifiedTopology:true
// },(err)=>{
// if(err){
//     console.log('connection err'+err)
// }
// else{
//     console.log('connection established')
// }
// });