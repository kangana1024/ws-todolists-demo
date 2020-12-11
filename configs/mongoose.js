const mongoose = require('mongoose');
if (!process.env.MONGO_CONN_URL) {
  require("dotenv").config()
}

Object.keys(mongoose.connection.models).forEach(key => {
  delete mongoose.connection.models[key];
});

mongoose.connect(process.env.MONGO_CONN_URL, { useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;