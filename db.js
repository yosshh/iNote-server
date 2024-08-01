const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://admin:admin@cluster0.0xai4l1.mongodb.net/';

async function connectToMongo() {
  await mongoose.connect(mongoURI).then(()=> console.log("Connected to Mongo Successfully")).catch(err => console.log("error hai",err));
}
  
module.exports = connectToMongo;