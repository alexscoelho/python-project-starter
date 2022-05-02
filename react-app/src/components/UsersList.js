import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const responseData = await response.json();
      setUsers(responseData.users);
    }
    fetchData();
  }, []);

  const userComponents = users.map((user) => {
    return (
      <li key={user.id}>
        <NavLink to={`${process.env.REACT_APP_API_URL}/users/${user.id}`}>{user.username}</NavLink>
      </li>
    );
  });

  return (
    <>
      <h1>List of Users Available: </h1>
      <ul>{userComponents}</ul>
    </>
  );
}

export default UsersList;
