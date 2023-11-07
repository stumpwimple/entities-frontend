// ImageDialog.js
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const ImageDialog = ({ open, onClose, entity, onGenerateArt }) => {
  console.log("entity", entity);
  const { image_urls } = entity || { image_urls: [] };
  console.log("image_urls", image_urls);

  // Function to handle the click event and check for Ctrl key
  const handleButtonClick = (event) => {
    if (event.ctrlKey) {
      console.log("Ctrl key was pressed during the button click");
      // Handle the Ctrl+click functionality here
      onGenerateArt();
    }
    onGenerateArt();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Entity Images</DialogTitle>
      <DialogContent dividers>
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
        <p>
          Please note, images are fleeting right now. They will expire, so save
          any you want to keep.
        </p>
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
