import { GraphQLServer } from 'graphql-yoga';
import Todo from './src/models/todo';

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
`;

const resolvers = {
  Query: {
    todos: async (_, arg) => {
      const { offset = 0, first = 10, search = '' } = arg;
      let todoOpt = {};
      if (search !== '') {
        todoOpt = { todo: new RegExp('^' + search + '$', "i") }
      }
      const items = await Todo.find(todoOpt).skip(offset).limit(first).exec()
      const count = await Todo.count(todoOpt)
      return {
        items,
        count
      }
    }
  },
  Mutation: {
    postTodo: async (_, { todo, status = 'pending' }) => {
      return new Promise((resolve, reject) => {
        const todoInsert = new Todo({ todo, status });

        todoInsert.save().then(data => {
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    updateTodo: (_, { id, todo }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndUpdate(id, { todo }).then(data => {
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    updateStatus: (_, { id, status }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndUpdate(id, { status }).then(data => {
          resolve(data._id);
        }).catch(err => {
          console.log('error : ', err);
          reject(err);
        })
      })
    },
    removeTodo: (_, { id }) => {
      return new Promise((resolve, reject) => {
        Todo.findByIdAndRemove(id).then(data => {
          let res = false;
          if (data._id) {
            res = true;
          }
          resolve(res);
        }).catch(err => {
          console.log('error : ', err);
          reject(false);
        })
      })
    }
  }
}

const server = new GraphQLServer({ typeDefs, resolvers });
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