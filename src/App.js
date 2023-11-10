import React, { useContext, useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { create_entity, test_create_entity } from "./apiUtils";

import "react-tabs/style/react-tabs.css";
import "./App.css";

import { DataContext } from "./DataContext";
import supabase from "./supabaseClient";

import { Container, Typography, Button } from "@material-ui/core";

import EntityTable from "./components/EntityTable";
import SingleEntity from "./components/SingleEntity";
import DialogComponent from "./components/DialogComponent";
import EntityCreationDialog from "./components/EntityCreationDialog";

import LoadingImage from "./components/LoadingImage";
import Login from "./components/Login";

function App() {
  const {
    user,
    setUser,
    entityData,
    setEntityData,
    selectedEntityId,
    setSelectedEntityId,
  } = useContext(DataContext);
  const [session, setSession] = useState(null);


  const [dialogState, setDialogState] = useState({
    open: false,
    content: "",
    title: "Entity Creation",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const [showLoadingImage, setShowLoadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchEntities = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .eq("user_id", String(user))
        .order("order", { ascending: true });
      if (data) setEntityData(data);
    }
  };

  const closeLoadingImage = () => {
    setShowLoadingImage(false);
  };

  useEffect(() => {
    // Generate the image list based on naming convention and count
    const totalImages = 52;
    const imageList = Array.from(
      { length: totalImages },
      (_, i) => `loading_image_${i + 1}.png`
    );

    // Randomly select an image from the list
    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
    setSelectedImage(randomImage);

    //Load Image on session start
    if (!sessionStorage.getItem("hasSeenLoadingImage")) {
      setShowLoadingImage(true);
      setTimeout(() => {
        setShowLoadingImage(false);
      }, 3000);

      // Set the local storage flag so the user doesn't see the image again
      sessionStorage.setItem("hasSeenLoadingImage", "true");
    }
  }, [session]);

  useEffect(() => {
    // Get the current session immediately upon component mount
    supabase.auth
      .getSession()
      .then((response) => {
        if (response && response.data && response.data.session) {
          setSession(response.data.session);
          setUser(response.data.session.user.id);
        }
      })
      .catch((error) => {
        console.error("Error getting session:", error);
      });

    // Set up a listener for future auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && session.user) {
        setUser(session.user.id);
      }
    });

    // Cleanup the listener on component unmount
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEntities();
    }
  }, [user]);

  return (
    <div className="App">
      <Container style={{ padding: 0 }}>
        <div className="header-dark" onClick={() => setSelectedEntityId(null)}>
          <img
            src={`${process.env.PUBLIC_URL}/Accretion-Blur96x192.png`}
            srcSet={`${process.env.PUBLIC_URL}/Accretion-Blur96x192.png 192w, ${process.env.PUBLIC_URL}/Accretion-Blur96x156.png 156w`}
            sizes="(max-width: 600px) 96px, 192px"
            alt="Your Logo"
          />
          <Typography variant="h3">Entities</Typography>
        </div>

        {!session ? (
          <Container>
            {/* <Auth
              supabaseClient={supabase}
              redirectTo="stumpwimple.github.io/entities-frontend/"
              providers={["google"]}
            /> */}
            <Login />
          </Container>
        ) : (
          <>
            {/* Conditional rendering of the loading image */}
            {showLoadingImage && (
              <LoadingImage
                selectedImage={selectedImage}
                closeLoadingImage={closeLoadingImage}
              />
            )}

            {/* <Campaign user={user} /> */}
            <p>Logged in: {session.user.email}</p>

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
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
            >
              Create New Entity
            </Button>

            <EntityCreationDialog
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              user={user}
              fetchEntities={fetchEntities}
              create_entity={create_entity}
              test_create_entity={test_create_entity}
            />
            <button
              className="top-right-button"
              onClick={() => {
                supabase.auth.signOut();
                sessionStorage.removeItem("hasSeenLoadingImage");
              }}
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
