const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const url = process.env.MONGODB_URI;

console.log(`Connecting to ${url}`);
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(result => {
    console.log("Connected to MongoDB");
  })
  .catch(error => {
    console.log(`Error cnnecting to MongoDB: ${error.message}`);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  number: String,
});

personSchema.plugin(uniqueValidator);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = new mongoose.model("Person", personSchema);
