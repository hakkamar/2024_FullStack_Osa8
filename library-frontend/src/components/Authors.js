import { useState } from "react";
import Select from "react-select";

import { useMutation } from "@apollo/client";
import { ADD_BIRTHYEAR, ALL_AUTHORS } from "../queries";

const Authors = ({ authors, token, setError }) => {
  const [nameToUpdate, setNameToUpdate] = useState(null);
  const [born, setBorn] = useState("");

  const [addBirthYear] = useMutation(ADD_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      setError(messages);
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    addBirthYear({
      variables: {
        name: nameToUpdate.value,
        setBornTo: parseInt(born),
      },
    });

    setBorn("");
    setNameToUpdate(null);
  };

  if (!authors) {
    return null;
  }

  let noBirthYear = authors.filter((a) => a.born === null);
  let options = [];
  for (let i = 0; i < noBirthYear.length; i++) {
    options[i] = {
      value: noBirthYear[i].name,
      label: noBirthYear[i].name,
    };
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {token && noBirthYear.length > 0 ? (
        <div>
          <h2>set birthyear</h2>
          <form onSubmit={submit}>
            <Select
              defaultValue={nameToUpdate}
              selectedValue={nameToUpdate}
              value={nameToUpdate || ""}
              onChange={setNameToUpdate}
              options={options}
            />
            <div>
              born
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </div>
      ) : (
        <div>...</div>
      )}
    </div>
  );
};

export default Authors;
