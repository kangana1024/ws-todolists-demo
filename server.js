const { GraphQLServer } = require('graphql-yoga');

const todoLists = [];

const typeDefs = `
  type TodoList {
    id: ID!
    todo: String!
    status: String
  }

  type Query {
    todos: [TodoList!]
  }


  type Mutation {
    postTodo(todo:String!, status: String):ID!
    updateTodo(id:ID!, todo: String!):ID!
    updateStatus(id:ID!, status: String!):ID!
    removeTodo(id:ID!):ID!
  }
`;

const resolvers = {
  Query: {
    todos: () => todoLists
  },
  Mutation: {
    postTodo: (_, { todo, status = 'pending' }) => {
      const id = todoLists.length + 1
      todoLists.push({
        id,
        todo,
        status
      })
      return id
    },
    updateTodo: (_, { id, todo }) => {
      let tmp = todoLists.find(item => {
        return item.id.toString() === id.toString()
      });

      if (tmp) {
        tmp.todo = todo
      }
      console.log(tmp)
      return id
    },
    updateStatus: (_, { id, status }) => {
      let tmp = todoLists.find(item => {
        return item.id.toString() === id.toString()
      });

      if (tmp) {
        tmp.status = status
      }
      return id
    },
    removeTodo: (_, { id }) => {
      todoLists = [...todoLists].filter(item => {
        return item.id.toString() != id.toString()
      })
      return id
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