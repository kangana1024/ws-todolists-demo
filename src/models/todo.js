import mongoose from '../../configs/mongoose';

const Schema = mongoose.Schema;

const todoSchema = new Schema({
  todo: { type: String },
  status: { type: String }
});

const Todo = mongoose.model('todos', todoSchema);

export default Todo;