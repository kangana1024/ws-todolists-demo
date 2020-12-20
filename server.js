const { GraphQLServer } = require('graphql-yoga');
const todoLists = [
  {
    id: 1,
    todo: "todo 01",
    status: "PENDING"
  },
  {
    id: 2,
    todo: "todo 02",
    status: "PENDING"
  },
];

const typeDefs = `
  type TodoList {
    id: ID!
    todo: String!
    status: String!
  }

  type Query {
    todos: [TodoList]
  }

  type Mutation {
    addTodo(todo:String!,status:String):ID!
  }
`;
const resolvers = {
  Query: {
    todos: function () {
      return todoLists
    }
  },
  Mutation: {
    addTodo: function (_, { todo, status = 'PENDING' }) {
      const id = todoLists.length + 1; // create ID

      todoLists.push({
        id,
        todo,
        status
      }); // Push new todo

      return id
    }
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
const options = {
  port: 5000
}
server.start(options, function ({ port }) {
  console.log(`server start on port : ${port}`)
})
