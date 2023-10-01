import {
  Container,
  Grid,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import { useState, useContext, useEffect } from "react";
import EditDialog from "./EditDialog";
import supabase from "../supabaseClient";
import { DataContext } from "../DataContext";
import axios from "axios";

function SingleEntity({ thisEntity }) {
  const [nameOrTypeFilter, setNameOrTypeFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);
  const [editingEntity, setEditingEntity] = useState(null);
  const {
    user,
    formData,
    selectedEntityId,
    setSelectedEntityId,
    setEntityData,
    entityData,
  } = useContext(DataContext);
  const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);

  const entity = entityData.find((entity) => entity.id === selectedEntityId);

  console.log("thisEntity:", entity);

  const createSubEntity = async (subEntityInfo) => {
    // const { data, error } = await supabase
    //   .from("entities")
    //   .insert([{ description: "test" }]);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-entity",
        {
          entity_description: subEntityInfo,
          user_id: user,
          parent_id: selectedEntityId,
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

  const filteredProperties = entity.properties.filter(
    (prop) =>
      prop.name.toLowerCase().includes(nameOrTypeFilter.toLowerCase()) ||
      prop.description.toLowerCase().includes(nameOrTypeFilter.toLowerCase())
  );

  const startEditing = (entity, field, propertyIndex = null) => {
    setFieldBeingEdited(field);
    setEditingEntity(entity.id);
    setIsDialogOpen(true);
    setFieldBeingEdited(field);
    setEditingPropertyIndex(propertyIndex);
    if (field === "properties") {
      setEditedData(entity.properties[propertyIndex].description);
    } else if (field === "name") {
      setEditedData(entity.name);
    } else if (field === "description") {
      setEditedData(entity.description);
    }
  };

  function handleConfirmEdit(newValue) {
    setEditedData(newValue);
    saveEditedEntity();
  }

  const saveEditedEntity = async (newValue) => {
    const updatedData = {};
    if (fieldBeingEdited === "name") {
      updatedData.name = newValue;
    } else if (fieldBeingEdited === "description") {
      updatedData.description = newValue;
    } else console.log("Updating entity with ID:", editingEntity);
    console.log("Data being sent to Supabase:", updatedData);

    const { data, error } = await supabase
      .from("entities")
      .update(updatedData)
      .eq("id", editingEntity);

    if (!error) {
      console.log("Successfully updated entity. Updating local state...");
      console.log("entity data", thisEntity);

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
          } else if (fieldBeingEdited === "properties") {
            updatedEntity.properties[editingPropertyIndex].description =
              newValue;
            console.log("properties: Updated Entity:", updatedEntity);
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

  const clearFilters = () => {
    setNameOrTypeFilter("");
    setDescriptionFilter("");
    setSelectedEntityId(null);
  };

  const parentEntity = entityData.find((e) => e.id === entity.parent_id);

  return (
    <Container className="container80">
      <Grid container spacing={3} alignItems="top" className="entityRow">
        <Grid item xs={3}>
          <Typography variant="h5">Entity Name:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="h4">{entity.name}</Typography>
        </Grid>
        {entity.parent_id != "00000000-0000-0000-0000-000000000000" && (
          <>
            <Grid item xs={3}>
              <Typography variant="h6">Parent:</Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography
                variant="h6"
                onClick={() => {
                  setSelectedEntityId(parentEntity.id);
                  console.log("Setting ID:", parentEntity.id);
                }}
                style={{ cursor: "pointer" }}
              >
                {parentEntity ? parentEntity.name : "Not Found"}
              </Typography>
            </Grid>
          </>
        )}
        <Grid item xs={3}>
          <Typography variant="h6">Type:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="body1">{entity.entity_type}</Typography>
        </Grid>
        <Grid item xs={3} className="flexContainer">
          <Typography variant="h6">Description</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography
            variant="body1"
            onClick={() => startEditing(entity, "description")}
            style={{ cursor: "pointer" }}
          >
            {entity.description}
          </Typography>

          <EditDialog
            isOpen={isDialogOpen && fieldBeingEdited !== "properties"}
            onClose={() => setIsDialogOpen(false)}
            onSave={(newValue) => saveEditedEntity(newValue)}
            initialValue={
              fieldBeingEdited === "name" ? entity.name : entity.description
            }
            onConfirmEdit={handleConfirmEdit}
            fieldBeingEdited={fieldBeingEdited}
          />
        </Grid>

        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={3}>
            <button onClick={clearFilters}>Clear Filters</button>
          </Grid>
          <Grid item xs={9}>
            <TextField
              label="Filter"
              variant="standard"
              size="small"
              fullWidth
              value={nameOrTypeFilter}
              onChange={(e) => setNameOrTypeFilter(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Entity Data */}

        {filteredProperties.map((property, index) => (
          <>
            <Grid item xs={3}>
              <Typography variant="body1">{property.name}</Typography>
              <button
                onClick={() =>
                  createSubEntity(
                    property.name + ": with description " + property.description
                  )
                }
              >
                Expand
              </button>
            </Grid>
            <Grid item xs={9}>
              <Typography
                variant="body1"
                onClick={() => startEditing(entity, "properties", index)}
                style={{ cursor: "pointer" }}
              >
                {property.description}
              </Typography>
              <EditDialog
                isOpen={
                  isDialogOpen &&
                  fieldBeingEdited === "properties" &&
                  editingPropertyIndex === index
                }
                onClose={() => setIsDialogOpen(false)}
                onSave={(newValue) => saveEditedEntity(newValue)}
                initialValue={property.description}
                onConfirmEdit={handleConfirmEdit}
                fieldBeingEdited={fieldBeingEdited}
              />
            </Grid>
          </>
        ))}
      </Grid>

      <br />

      {entityData.map(
        (sub_entity) =>
          sub_entity.parent_id === selectedEntityId && (
            <Grid
              container
              key={sub_entity.id}
              spacing={3}
              alignItems="top"
              className="entityRow"
            >
              <Grid item xs={3} className="flexContainer">
                {/* <span
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
                    fieldBeingEdited === "name"
                      ? entity.name
                      : entity.description
                  }
                  onConfirmEdit={handleConfirmEdit}
                  fieldBeingEdited={fieldBeingEdited}
                /> */}

                <Typography
                  variant="h6"
                  onClick={() => {
                    setSelectedEntityId(sub_entity.id);
                    console.log("Setting ID:", sub_entity.id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {sub_entity.name}
                </Typography>

                <Typography variant="body2">
                  {sub_entity.entity_type}
                </Typography>
              </Grid>
              <Grid item xs={9}>
                {/* <span
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
                /> */}
                <Typography variant="body2">
                  {sub_entity.description}
                </Typography>
              </Grid>
            </Grid>
          )
      )}
    </Container>
  );
}

export default SingleEntity;
