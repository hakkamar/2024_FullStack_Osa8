const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const resolvers = {
  Query: {
    allAuthors: async () => Author.find({}),
    usersBooks: async (root, args, { currentUser }) => {
      if (!currentUser) {
        return [];
      }

      const kirjat = await Book.find({}).populate("author");

      let palautettavat = kirjat.filter((k) => {
        for (let index = 0; index < k.genres.length; index++) {
          if (
            k.genres[index].toUpperCase() ===
            currentUser.favoriteGenre.toUpperCase()
          ) {
            return k;
          }
        }
      });

      return palautettavat;
    },
    allBooks: async (root, args) => {
      const { author, genre } = args;

      let kirjat = await Book.find({}).populate("author");

      if (!author && !genre) {
        return kirjat;
      }

      if (author) {
        kirjat = kirjat.filter(
          (b) => b.author.name.toUpperCase() === author.toUpperCase()
        );
      }

      if (genre) {
        let palautettavat = kirjat.filter((k) => {
          for (let index = 0; index < k.genres.length; index++) {
            if (k.genres[index].toUpperCase() === genre.toUpperCase()) {
              return k;
            }
          }
        });

        return palautettavat;
      }

      return kirjat;
    },
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async ({ name }) => {
      if (!name) {
        return 0;
      }
      let kirjat = await Book.find({}).populate("author");
      kirjailijanKirjat = kirjat.filter(
        (p) => p.author.name.toUpperCase() === name.toUpperCase()
      );
      return kirjailijanKirjat.length;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      let authorId = null;
      let authorToUpdate = await Author.findOne({ name: args.author });

      if (!authorToUpdate) {
        const author = new Author({ name: args.author, born: null });
        authorId = author.id;

        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError("Saving author failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      } else {
        authorId = authorToUpdate.id;
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: authorId,
        genres: args.genres,
      });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.author,
            error,
          },
        });
      }
      return book;
    },

    editAuthor: async (root, args, context) => {
      const { name, setBornTo } = args;

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      let author = await Author.findOne({ name: name });
      if (!author) {
        return null;
      }

      author.born = setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Adding Birth Year faild", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
      return author;
    },

    createUser: async (root, args) => {
      const { username, favoriteGenre } = args;
      const user = new User({
        username: username,
        favoriteGenre: favoriteGenre,
      });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

module.exports = resolvers;
