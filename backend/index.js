const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const jwt = require("jsonwebtoken");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

require("dotenv").config();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const User = require("./models/user");

const MONGODB_URI = process.env.MONGODB_URI;

console.log("--------------------------------------------");
console.log("connecting to", MONGODB_URI);
console.log("");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("...connected to MongoDB");
    console.log("--------------------------------------------");
    console.log("");
  })
  .catch((error) => {
    console.log("********************************************");
    console.log("error connection to MongoDB:", error.message);
    console.log("********************************************");
    console.log("");
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT;

startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
  console.log("");
});
