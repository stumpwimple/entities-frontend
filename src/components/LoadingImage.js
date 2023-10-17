import React from "react";
import { Typography } from "@material-ui/core";
import "../App.css";

function LoadingImage({ selectedImage, closeLoadingImage }) {
  return (
    <div className="loadingImage-container" onClick={closeLoadingImage}>
      <Typography variant="h3" className="loadingImage-text">
        Welcome to Entities
      </Typography>
      <img
        src={`${process.env.PUBLIC_URL}/images/${selectedImage}`}
        alt="Entities Load Scene"
      />
    </div>
  );
}

export default LoadingImage;
