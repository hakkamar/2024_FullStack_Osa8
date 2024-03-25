import { useQuery, useApolloClient } from "@apollo/client";
import { useState } from "react";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommendations from "./components/Recommendations";
import LoginForm from "./components/LoginForm";

import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

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
  const [token, setToken] = useState(null);

  const result = useQuery(ALL_AUTHORS);
  const client = useApolloClient();

  const navigate = useNavigate();

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();

    navigate("/");
  };

  if (result.loading) {
    return <div>loading...</div>;
  }

  //console.log("App - token", token);

  return (
    <div>
      <div>
        <Link style={padding} to="/">
          Authors
        </Link>
        <Link style={padding} to="/books">
          Books
        </Link>
        {token ? (
          <Link style={padding} to="/recommendations">
            Recommendations
          </Link>
        ) : null}
        <Link style={padding} to="/addbook">
          Add book
        </Link>
        {token ? (
          <em>
            You have logged in <button onClick={handleLogout}>logout</button>
          </em>
        ) : (
          <Link style={padding} to="/login">
            Login
          </Link>
        )}
      </div>

      <Notify errorMessage={errorMessage} />

      <Routes>
        <Route
          path="/"
          element={
            <Authors
              authors={result.data.allAuthors}
              token={token}
              setError={notify}
            />
          }
        />
        <Route path="/books" element={<Books />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route
          path="/addbook"
          element={
            token ? (
              <NewBook setError={notify} />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={<LoginForm setError={notify} setToken={setToken} />}
        />
      </Routes>
    </div>
  );
};

export default App;
