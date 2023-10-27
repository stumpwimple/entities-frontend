import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { entityTypes } from "./entityTypes";
import { Radio, Typography } from "@material-ui/core";

const SubEntityCreationDialog = ({
  user,
  fetchEntities,
  create_entity,
  test_create_entity,
  dialogOpen,
  setDialogOpen,
  subEntityBgContext,
  entity,
  property,
  onClose,
}) => {
  const [entityBgContext, setEntityBgContext] = useState(entity.description);
  const [promptDescription, setPromptDescription] = useState("");
  const [entityDescription, setEntityDescription] = useState(
    property ? property.description : ""
  );
  const [entityType, setEntityType] = useState("");
  const [numberOfProperties, setNumberOfProperties] = useState(6);
  const [status, setStatus] = useState("");
  const [genObject, setGenObject] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "entityType") {
      setEntityType(value);
    } else if (name === "numberOfProperties") {
      setNumberOfProperties(value);
    } else if (name === "entityDescription") {
      setEntityDescription(value);
    }
  };

  const handleCreateEntity = async (event) => {
    setStatus("creating...");

    let bgContext = `An entity of type ${property.name} with entity description "${entityDescription}`;

    if (genObject) {
      bgContext += `." Instead of the normal property development process, each of the properties should be a specific and unique example with a name and brief description given`;
    }

    bgContext += `. Develop and Create the entity with at least ${numberOfProperties} properties. While creating the entity consider its parent entity for context and background consideration.  parent entity name: ${entity.name}, parent summary: ${entity.description}`;

    console.log(bgContext);
    setPromptDescription(bgContext);

    try {
      let result = null;
      if (event.ctrlKey) {
        result = await test_create_entity(bgContext);
      } else {
        result = await create_entity(bgContext);
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

  useEffect(() => {
    if (property) {
      setEntityDescription(property.description);
      console.log("property:", property);
    }
  }, [property]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => {
        onClose();
        setDialogOpen(false);
      }}
    >
      <DialogTitle>Create Sub-Entity</DialogTitle>
      <DialogContent>
        {/* Form fields */}
        <Typography variant="body1">
          <strong>Background Context:</strong> {entityBgContext}
        </Typography>
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
          name="numberOfProperties"
          value={numberOfProperties}
          onChange={handleInputChange}
        >
          <option value="4">4 properties</option>
          <option value="5">5 properties</option>
          <option value="6">6 properties</option>
          <option value="7">7 properties</option>
          <option value="8">8 properties</option>
        </select>
        <input
          type="checkbox"
          checked={genObject}
          onChange={() => setGenObject(!genObject)}
        />
        <label>obj?</label>
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

export default SubEntityCreationDialog;
