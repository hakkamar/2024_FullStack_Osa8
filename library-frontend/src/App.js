import { useQuery } from "@apollo/client";
import { useState } from "react";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

import { Routes, Route, Link } from "react-router-dom";

import { ALL_AUTHORS } from "./queries";

const padding = {
  padding: 5,
};

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);

  const result = useQuery(ALL_AUTHORS);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  if (result.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <div>
        <Link style={padding} to="/">
          Authors
        </Link>
        <Link style={padding} to="/books">
          Books
        </Link>
        <Link style={padding} to="/addbook">
          Add book
        </Link>
      </div>

      <Notify errorMessage={errorMessage} />

      <Routes>
        <Route
          path="/"
          element={
            <Authors authors={result.data.allAuthors} setError={notify} />
          }
        />
        <Route path="/books" element={<Books />} />
        <Route path="/addbook" element={<NewBook setError={notify} />} />
      </Routes>
    </div>
  );
};

export default App;
