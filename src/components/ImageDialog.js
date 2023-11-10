// ImageDialog.js
import React, { useContext, useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import supabase from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { DataContext } from "../DataContext";

const ImageDialog = ({ open, onClose, entity, onGenerateArt }) => {
  const { image_urls } = entity || { image_urls: [] };
  const { user, setUser } = useContext(DataContext);
  const [media, setMedia] = useState([]);
  const [refreshMedia, setRefreshMedia] = useState(false);
  const STORAGE_URL =
    "https://xmjskkioikpynmxnsskj.supabase.co/storage/v1/object/public";

  // Function to handle the click event and check for Ctrl key
  const handleButtonClick = async (event) => {
    if (event.ctrlKey) {
      console.log("Ctrl key was pressed during the button click");
      // Handle the Ctrl+click functionality here
      await onGenerateArt();
    } else {
      await onGenerateArt();
    }
    setRefreshMedia(!refreshMedia); // Trigger refresh after image generation
  };

  async function uploadImage(e) {
    let file = e.target.files[0];
    let filePath = `${user}/${entity.id}/${uuidv4()}`;

    const { data, error } = await supabase.storage
      .from("generated-images")
      .upload(filePath, file);

    if (data) {
      getMedia();
    } else {
      console.log(error);
    }
  }

  async function getMedia() {
    const { data, error } = await supabase.storage
      .from("generated-images")
      .list(user + "/" + entity.id + "/", {
        limit: 10,
        offset: 0,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (data) {
      setMedia(data);
    } else {
      console.log(71, error);
    }
  }

  useEffect(() => {
    const fetchMedia = async () => {
      await getMedia();
    };

    fetchMedia();
  }, [user, entity, refreshMedia]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Entity Images</DialogTitle>
      <DialogContent dividers>
        <>
          {media && media.length > 0 ? (
            media.map((file, index) => (
              <div key={index}>
                <img
                  src={`${STORAGE_URL}/generated-images/${user}/${entity.id}/${file.name}`}
                  alt={`Media ${index}`}
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              </div>
            ))
          ) : (
            <p>No uploaded images available.</p>
          )}
          <input type="file" onChange={(e) => uploadImage(e)} />

          <hr className="customLine" style={{ width: "80vw" }} />

          {image_urls && image_urls.length > 0 ? (
            image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Entity Image ${index + 1}`}
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            ))
          ) : (
            <p>No images available.</p>
          )}

          <Button onClick={handleButtonClick} color="primary">
            Create New Image
          </Button>

          <hr className="customLine" style={{ width: "80vw" }} />
          <p>
            Please note, images are fleeting right now. They will expire, so
            save any you want to keep.
          </p>
        </>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleButtonClick} color="primary">
          Create New Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageDialog;
