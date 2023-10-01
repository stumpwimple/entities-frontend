import {
  Container,
  Grid,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useContext } from "react";
import EditDialog from "./EditDialog";
import supabase from "../supabaseClient";

import { DataContext } from "../DataContext";

function EntityTable({ entityData, setSelectedEntityId }) {
  const { user, selectedEntityId, setEntityData } = useContext(DataContext);
  const [nameOrTypeFilter, setNameOrTypeFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [editingEntity, setEditingEntity] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedProperties, setEditedProperties] = useState(null);
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);

  const filteredData = entityData.filter((entity) => {
    const nameMatch = entity.name
      ?.toLowerCase()
      .includes(nameOrTypeFilter.toLowerCase());
    const typeMatch = entity.entity_type
      ?.toLowerCase()
      .includes(nameOrTypeFilter.toLowerCase());
    const descriptionMatch = entity.description
      ?.toLowerCase()
      .includes(descriptionFilter.toLowerCase());

    return (nameMatch || typeMatch) && descriptionMatch;
  });

  const clearFilters = () => {
    setNameOrTypeFilter("");
    setDescriptionFilter("");
    setSelectedEntityId(null);
  };

  const startEditing = (entity, field) => {
    setFieldBeingEdited(field);
    setEditingEntity(entity.id);
    setIsDialogOpen(true);
    setFieldBeingEdited(field);

    if (field === "name") {
      setEditedData(entity.name);
    } else if (field === "description") {
      setEditedData(entity.description);
    }
    // Add more conditions for other fields as needed
  };

  function handleConfirmEdit(newValue) {
    setEditedData(newValue);
    saveEditedEntity();
  }

  // const saveEditedEntity = async (newValue) => {
  //   console.log("editedData:", editingEntity, editedData, newValue);
  //   // Update entity in Supabase
  //   const { data, error } = await supabase
  //     .from("entities")
  //     .update({ name: newValue })
  //     .eq("id", editingEntity);

  //   // If the update is successful, update local state
  // };

  const saveEditedEntity = async (newValue) => {
    const updatedData = {};
    if (fieldBeingEdited === "name") {
      updatedData.name = newValue;
    } else if (fieldBeingEdited === "description") {
      updatedData.description = newValue;
    }

    console.log("Updating entity with ID:", editingEntity);
    console.log("Data being sent to Supabase:", updatedData);

    const { data, error } = await supabase
      .from("entities")
      .update(updatedData)
      .eq("id", editingEntity);

    if (!error) {
      console.log("Successfully updated entity. Updating local state...");
      console.log("entity data", entityData);

      const updatedEntities = entityData.map((entity) => {
        if (entity.id === editingEntity) {
          console.log("entity", entity);
          console.log({ ...entity, [fieldBeingEdited]: newValue });

          let updatedEntity = { ...entity };
          if (fieldBeingEdited === "name") {
            updatedEntity.name = newValue;
            console.log(editedData);
            console.log("name: Updated Entity:", updatedEntity);
          } else if (fieldBeingEdited === "description") {
            updatedEntity.description = newValue;
            console.log("description: Updated Entity:", updatedEntity);
          }
          console.log("Updated Entity (Alternative method):", updatedEntity);

          return updatedEntity; // Just return the updatedEntity
        }
        return entity;
      });

      setEntityData(updatedEntities);
      console.log("updatedEntities", updatedEntities);
      setEditingEntity(null);
    } else {
      // Handle the error appropriately
      console.error("Error updating entity:", error);
    }
  };

  return (
    <Container className="container80">
      <h2>User's Entities</h2>
      <button onClick={clearFilters}>Clear Filters</button>
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={3}>
          <TextField
            label="By Name or Type"
            variant="standard"
            size="small"
            fullWidth
            value={nameOrTypeFilter}
            onChange={(e) => setNameOrTypeFilter(e.target.value)}
          />
        </Grid>
        <Grid item xs={9}>
          <TextField
            label="By Description"
            variant="standard"
            size="small"
            fullWidth
            value={descriptionFilter}
            onChange={(e) => setDescriptionFilter(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Entity Data */}
      {filteredData.map((entity) => (
        <Grid
          container
          key={entity.id}
          spacing={3}
          alignItems="top"
          className="entityRow"
        >
          <Grid item xs={3} className="flexContainer">
            <span
              class="material-icons edit-icons"
              onClick={() => startEditing(entity, "name")}
              style={{ cursor: "pointer" }}
            >
              edit
            </span>
            <EditDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSave={(newValue) => saveEditedEntity(newValue)}
              initialValue={
                fieldBeingEdited === "name" ? entity.name : entity.description
              }
              onConfirmEdit={handleConfirmEdit}
              fieldBeingEdited={fieldBeingEdited}
            />
            <Typography
              variant="h6"
              onClick={() => setSelectedEntityId(entity.id)}
              style={{ cursor: "pointer" }}
            >
              {entity.name}
            </Typography>

            <Typography variant="body2">{entity.entity_type}</Typography>
          </Grid>
          <Grid item xs={9}>
            <span
              class="material-icons edit-icons"
              onClick={() => startEditing(entity, "description")}
              style={{ cursor: "pointer" }}
            >
              edit
            </span>
            <EditDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSave={(newValue) => saveEditedEntity(newValue)}
              initialValue={editedData}
              onConfirmEdit={handleConfirmEdit}
              fieldBeingEdited="description"
            />
            <Typography variant="body2">{entity.description}</Typography>
          </Grid>
        </Grid>
      ))}
    </Container>
  );
}

export default EntityTable;
