import mongoose from '../../configs/mongoose';

const Schema = mongoose.Schema;

const todoSchema = new Schema({
  todo: { type: String },
  status: { type: String },
  date_added: { type: Date }
});

const Todo = mongoose.model('todos', todoSchema);

export default Todo;