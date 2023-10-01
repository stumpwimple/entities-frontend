import React, { useContext, useEffect, useState } from "react";
import "react-tabs/style/react-tabs.css"; // Import default styles
import "./App.css";
// import Campaign from "./components/Campaign";
import { DataContext } from "./DataContext";
import { Auth } from "@supabase/auth-ui-react";
import supabase from "./supabaseClient";
import { Container } from "@material-ui/core";
import axios from "axios";
import EntityTable from "./components/EntityTable";
import SingleEntity from "./components/SingleEntity";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

function App() {
  const {
    user,
    setUser,
    formData,
    setFormData,
    entityData,
    setEntityData,
    selectedEntityId,
    setSelectedEntityId,
  } = useContext(DataContext);
  const [session, setSession] = useState(null);

  const create_entity = async () => {
    // const { data, error } = await supabase
    //   .from("entities")
    //   .insert([{ description: "test" }]);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-entity",
        {
          entity_description: formData.entityDescription,
          user_id: user,
          parent_id: "00000000-0000-0000-0000-000000000000",
        }
      );
      console.log(response.data);

      const newEntity = {
        ...response.data,
      };

      const updatedEntities = [...entityData, newEntity];

      setEntityData(updatedEntities);
    } catch (error) {
      console.error("Error details:", error.message);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Get the current session immediately upon component mount
    supabase.auth
      .getSession()
      .then((response) => {
        console.log("getSession response:", response);
        if (response && response.data && response.data.session) {
          setSession(response.data.session);
          setUser(response.data.session.user.id);
          console.log(response.data.session.user.id);
        }
      })
      .catch((error) => {
        console.error("Error getting session:", error);
      });

    // Set up a listener for future auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed. New session:", session);
      setSession(session);
      if (session && session.user) {
        console.log(session.user.id);
        setUser(session.user.id);
      }
    });

    // Cleanup the listener on component unmount
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const user_text = user;
    const fetchEntities = async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .eq("user_id", String(user_text));
      console.log("data", data[0]);
      if (data) setEntityData(data);
    };
    if (user) {
      fetchEntities();
    }
  }, [user]);

  return (
    <div className="App">
      <h1>Entities</h1>
      {!session ? (
        <Container>
          <Auth supabaseClient={supabase} />
        </Container>
      ) : (
        <>
          {/* <Campaign user={user} /> */}

          <p>Logged in: {session.user.email}</p>

          <button onClick={() => create_entity()}>Create Entity</button>
          <input
            type="text"
            id="description"
            name="entityDescription"
            value={formData.entityDescription}
            onChange={handleInputChange}
            placeholder="Entity Description"
          />

          {!selectedEntityId && (
            <EntityTable
              entityData={entityData}
              setSelectedEntityId={setSelectedEntityId}
            />
          )}
          {selectedEntityId && (
            <SingleEntity
              entityData={entityData.filter(
                (entity) => entity.id === selectedEntityId
              )}
            />
          )}

          <br />
          <button
            className="bottom-left-button"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </>
      )}
    </div>
  );
}

export default App;
