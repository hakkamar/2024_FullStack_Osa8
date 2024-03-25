import { useState } from "react";
import { useQuery } from "@apollo/client";
import Select from "react-select";

import { ALL_BOOKS } from "../queries";

function removeDuplicates(arr) {
  let unique = [];
  for (let i = 0; i < arr.length; i++) {
    if (unique.indexOf(arr[i]) === -1) {
      unique.push(arr[i]);
    }
  }
  return unique;
}

let ekaKerta = true;
let options = [];

const Books = (props) => {
  const [genreToShow, setGenreToShow] = useState("");

  const result = useQuery(ALL_BOOKS, {
    refetchQueries: [{ query: ALL_BOOKS }],
    pollInterval: 500,
    variables: { genre: genreToShow.value },
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!result.data) {
    return <div>hetki...</div>;
  }

  const books = result.data.allBooks;

  if (ekaKerta) {
    ekaKerta = false;

    let genretTmp = [];
    books.map((b) => {
      for (let index = 0; index < b.genres.length; index++) {
        genretTmp.push(b.genres[index].toLowerCase());
      }
      return genretTmp;
    });

    let kaikkiGenret = removeDuplicates(genretTmp);
    kaikkiGenret.sort();
    for (let i = 0; i < kaikkiGenret.length; i++) {
      options[i] = {
        value: kaikkiGenret[i],
        label: kaikkiGenret[i],
      };
    }
  }

  const filtteroi = async (event) => {
    event.preventDefault();
    setGenreToShow("");
    ekaKerta = true;
  };

  return (
    <div>
      <h2>books</h2>

      <div>
        <h2>Filtered by {genreToShow.value || " - no filtter -"}</h2>
        <form onSubmit={filtteroi}>
          <Select
            defaultValue={genreToShow}
            selectedValue={genreToShow}
            value={genreToShow}
            onChange={setGenreToShow}
            options={options}
          />
          <button type="submit">Show ALL genres</button>
        </form>
      </div>
      <hr></hr>
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

export default Books;
