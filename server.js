import { GraphQLServer, PubSub } from 'graphql-yoga';
import Todo from './src/models/todo';
const channel = "todolists";
const getTodo = async (arg) => {
  const { offset, first, search = '' } = arg;
  let todoOpt = {};
  if (search !== '') {
    todoOpt = { todo: new RegExp('^' + search + '$', "i") }
  }
  const items = await Todo.find(todoOpt).skip(offset).sort([['date_added', -1]]).limit(first).exec()
  const count = await Todo.count(todoOpt)
  return {
    items,
    count
  }
}
const typeDefs = `

  type TodoItem {
    id: ID!
    todo: String!
    status: String
  }

  type TodoLists {
    items: [TodoItem!]
    count: Int!
  }

  input TodoArgs {
    offset: Int
    first: Int
    search: String
  }

  type Query {
    todos(args:TodoArgs):TodoLists!
  }


  type Mutation {
    postTodo(todo:String!, status: String):ID!
    updateTodo(id:ID!, todo: String!):ID!
    updateStatus(id:ID!, status: String!):ID!
    removeTodo(id:ID!):Boolean!
  }

  type Subscription {
    todos(args:TodoArgs):TodoLists
  }
`;
const subscribers = [];
const onTodoUpdates = (fn) => subscribers.push(fn);
const resolvers = {
  Query: {
    todos: async (_, arg) => {
      return await getTodo(arg)
    }
  },
  Subscription: {
    todos: {
      subscribe: async (_, arg, { pubsub }) => {
        const todoRes = await getTodo(arg);
        onTodoUpdates(() => pubsub.publish(channel, { todos: todoRes }));
        setTimeout(() => pubsub.publish(channel, { todos: todoRes }), 0);
        return pubsub.asyncIterator(channel);
      }
    }
  },
  Mutation: {
    postTodo: async (_, { todo, status = 'pending' }) => {
      return new Promise((resolve, reject) => {
        const todoInsert = new Todo({ todo, status, date_added: new Date() });

        todoInsert.save().then(async (data) => {
          const todoRes = await getTodo({ offset: 0, first: 100, search: '' });
          pubsub.publish(channel, { todos: todoRes })
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    updateTodo: (_, { id, todo }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndUpdate(id, { todo }).then(async (data) => {
          const todoRes = await getTodo({ offset: 0, first: 100, search: '' });
          pubsub.publish(channel, { todos: todoRes })
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    updateStatus: (_, { id, status }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndUpdate(id, { status }).then(async (data) => {
          const todoRes = await getTodo({ offset: 0, first: 100, search: '' });
          pubsub.publish(channel, { todos: todoRes })
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    removeTodo: (_, { id }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndRemove(id).then(async (data) => {
          let res = false;
          if (data._id) {
            res = true;
          }
          const todoRes = await getTodo({ offset: 0, first: 100, search: '' });
          pubsub.publish(channel, { todos: todoRes })
          resolve(res);
        }).catch(err => {
          console.log('error : ', err);
          reject(false);
        })
      })
    }
  }
}

const pubsub = new PubSub();

const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
const opts = {
  port: 4000,
  cors: {
    credentials: true,
    origin: ["http://localhost:8080"]
  }
};

server.start(opts, ({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
})