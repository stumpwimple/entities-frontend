import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { entityTypes } from "./entityTypes";

const EntityCreationDialog = ({
  user,
  fetchEntities,
  create_entity,
  test_create_entity,
  dialogOpen,
  setDialogOpen,
}) => {
  const [entityDescription, setEntityDescription] = useState("");
  const [entityType, setEntityType] = useState("Aircraft");
  const [subEntities, setSubEntities] = useState(6);
  const [status, setStatus] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "entityType") {
      setEntityType(value);
    } else if (name === "subEntities") {
      setSubEntities(value);
    } else if (name === "entityDescription") {
      setEntityDescription(value);
    }
  };

  const handleCreateEntity = async (event) => {
    setStatus("creating...");

    try {
      let result = null;
      if (event.ctrlKey) {
        result = await test_create_entity(
          user,
          entityType,
          subEntities,
          entityDescription
        );
      } else {
        result = await create_entity(
          user,
          entityType,
          subEntities,
          entityDescription
        );
      }

      if (result && !result.success) {
        throw new Error(result.error || "Unknown error occurred.");
      }

      fetchEntities();
      setStatus("successful");
      setDialogOpen(true);

      // Close the dialog after 5 seconds
      setTimeout(() => {
        setDialogOpen(false);
        setStatus("");
      }, 5000);
    } catch (error) {
      // Handle error scenarios here
      setStatus(`Error: ${error.message}`);
      setDialogOpen(true);
    }
  };

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>Create Entity</DialogTitle>
      <DialogContent>
        {/* Form fields */}
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
          value={entityDescription}
          onChange={handleInputChange}
          placeholder="Describe the Entity you want to create, in as little or much detail as you'd like."
        />
        {/* Display the status below the textarea */}
        {status && (
          <div
            style={{
              marginTop: "10px",
              color: status.startsWith("Error") ? "red" : "green",
            }}
          >
            Status: {status}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCreateEntity} color="primary">
          Create
        </Button>
        <Button onClick={() => setDialogOpen(false)} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityCreationDialog;
