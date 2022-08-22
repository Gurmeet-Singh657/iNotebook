const mongoose=require('mongoose')
const {Schema}=mongoose

const NotesSchema=new Schema({
    // Since Notes are associated privately with a person
    // so we user foreign key to access the user
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tag:{
        type:String,
        default:"General"
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('notes',NotesSchema)