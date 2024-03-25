import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@apollo/client";
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS } from "../queries";

const NewBook = ({ setError }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      setError(messages);
    },
  });

  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();

    createBook({
      variables: {
        title: title,
        author: author,
        published: parseInt(published),
        genres: genres,
      },
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");

    navigate("/books");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <h2>add new Book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            name="title"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            name="author"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            name="published"
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            name="genre"
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button" name="genre-button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit" name="create-button">
          create book
        </button>
      </form>
    </div>
  );
};

export default NewBook;
