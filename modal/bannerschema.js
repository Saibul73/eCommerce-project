const mongoose =require('mongoose')

const bannerSchema = new mongoose.Schema({
    image:{
        type: String,
        required:true
    },
    heading:{
        type:String,
        reuired:true
    },
    subHeading:{
        type:String,
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'
    }
});
const bannerModel = mongoose.model("banner",bannerSchema)

module.exports = bannerModel;