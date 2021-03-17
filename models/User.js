const {Schema, model, Types} = require("mongoose")

const schema = new Schema({
    email: {type: String, required: true, unique:true},
    password: {type: String, required: true},
    tests: [{type: Types.ObjectId, ref:"test"}]

})

module.exports = model("User", schema)