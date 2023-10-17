import React from "react";
import { Typography } from "@material-ui/core";

function LoadingImage({ selectedImage, closeLoadingImage }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        border: "10px solid black",
        textAlign: "center",
      }}
      onClick={closeLoadingImage}
    >
      <Typography
        variant="h3"
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "10px",
        }}
      >
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
