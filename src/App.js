import React, { useContext, useEffect, useState } from "react";
import "react-tabs/style/react-tabs.css"; // Import default styles
import "./App.css";
// import Campaign from "./components/Campaign";
import { DataContext } from "./DataContext";
import { Auth } from "@supabase/auth-ui-react";
import supabase from "./supabaseClient";
import { Container, Typography } from "@material-ui/core";
import axios from "axios";
import EntityTable from "./components/EntityTable";
import SingleEntity from "./components/SingleEntity";

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
  const [entityType, setEntityType] = useState("");
  const [subEntities, setSubEntities] = useState(6);

  const entityTypes = [
    "Campaign",
    "Universe",
    "Galaxy",
    "Star System",
    "Planet",
    "Continent",
    "Region",
    "Special Location",
    "Character",
    "NPC",
    "Monster",
    "Creature",
    "Item",
    "Artifact",
    "Weapon",
    "Armor",
    "Spell",
    "Magical Item",
    "Advanced Technology",
    "Vehicle",
    "Ship",
    "Aircraft",
    "Spacecraft",
    "Building",
    "Structure",
    "Organization",
    "Faction",
    "Religion",
    "Pantheon",
    "Culture",
    "Language",
    "Event",
    "Quest",
    "Plot",
    "Story",
    "Adventure",
    "Encounter",
    "Other",
  ];

  entityTypes.sort();

  const create_entity = async () => {
    const modified_description =
      "type is " +
      entityType +
      ": with " +
      subEntities +
      "properties, and the following entity description" +
      formData.entityDescription;

    try {
      const response = await axios.post(
        "https://entities.fly.dev/generate-entity",
        {
          entity_description: modified_description,
          // entity_type: formData.entityType,
          // sub_entities: formData.subEntities,
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

    if (name === "entityType") {
      setEntityType(value);
    } else if (name === "subEntities") {
      setSubEntities(value);
    }

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
      <Container>
        <div
          onClick={() => setSelectedEntityId(null)}
          style={{ cursor: "pointer" }}
        >
          <Typography variant="h3">Entities</Typography>
        </div>
        {!session ? (
          <Container>
            <Auth supabaseClient={supabase} />
          </Container>
        ) : (
          <>
            {/* <Campaign user={user} /> */}
            <p>Logged in: {session.user.email}</p>
            <button onClick={() => create_entity()}>Create Entity</button>
            <select
              className="entityTypeSelect"
              name="entityType"
              value={entityType}
              onChange={handleInputChange}
            >
              <option value="">Optionally Select Entity Type</option>
              {entityTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>

            <select
              name="subEntities"
              value={subEntities}
              onChange={handleInputChange}
            >
              <option value="3">3 properties</option>
              <option value="6">6 properties</option>
              <option value="9">9 properties</option>
            </select>

            <br />
            <textarea
              type="text"
              id="description"
              name="entityDescription"
              className="entityDescription"
              value={formData.entityDescription}
              onChange={handleInputChange}
              placeholder="Describe the Entity you want to create, in as little or much detail as you'd like."
            />

            <hr className="customLine" />

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
      </Container>
    </div>
  );
}

export default App;
