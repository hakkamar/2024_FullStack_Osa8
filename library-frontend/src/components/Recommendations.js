import { useQuery } from "@apollo/client";
import { USERS_BOOKS, ME } from "../queries";

let books = [];
let me = {};

const Recommendations = (props) => {
  const result = useQuery(USERS_BOOKS, {
    pollInterval: 500,
    onError: (error) => {
      console.log("errori, horrori USERS_BOOKS haussa");
    },
  });
  const meResult = useQuery(ME, {
    pollInterval: 500,
    onError: (error) => {
      console.log("errori, horrori ME haussa");
    },
  });

  if (result.loading) {
    return <div>loading...</div>;
  } else {
    books = result.data.usersBooks;
  }

  if (meResult.loading) {
    return <div>searching...</div>;
  } else {
    me = meResult.data.me;
  }

  if (!me) {
    return <h2>No recommendations found...</h2>;
  }

  if (books.length < 1) {
    return <h2>No recommendations found for {me.favoriteGenre}...</h2>;
  }

  return (
    <div>
      <h2>Recommendations - Your favorit Genre: {me.favoriteGenre} </h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
