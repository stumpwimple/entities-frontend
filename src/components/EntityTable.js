import {
  Container,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";

import { useState, useContext, useRef } from "react";
import EditDialog from "./EditDialog";
import SearchDrawer from "./SearchDrawer";
import supabase from "../supabaseClient";

import { DataContext } from "../DataContext";
import "../App.css";

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
  const [currentEntity, setCurrentEntity] = useState(null);
  const [entityBeingEdited, setEntityBeingEdited] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState(null);
  const [editingEntityType, setEditingEntityType] = useState(null);
  const [showSubEntities, setShowSubEntities] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);

  const descriptionRef = useRef(null);

  const openDeleteDialog = (entity) => {
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setEntityToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredData = entityData.filter((entity) => {
    if (
      !showSubEntities &&
      entity.parent_id !== "00000000-0000-0000-0000-000000000000"
    ) {
      return false;
    }
    const nameMatch = entity.name
      ?.toLowerCase()
      .includes(nameOrTypeFilter.toLowerCase());
    const typeMatch = entity.entity_type
      ?.toLowerCase()
      .includes(nameOrTypeFilter.toLowerCase());
    const descriptionMatch = entity.description
      ?.toLowerCase()
      .includes(descriptionFilter.toLowerCase());

    const searchTermMatch = searchTerm
      ?.toLowerCase()
      .split(" ")
      .every(
        (term) =>
          entity.name?.toLowerCase().includes(term) ||
          entity.entity_type?.toLowerCase().includes(term) ||
          entity.description?.toLowerCase().includes(term)
      );

    return searchTermMatch !== ""
      ? searchTermMatch
      : (nameMatch || typeMatch) && descriptionMatch;

    //  return (nameMatch || typeMatch) && descriptionMatch;
  });

  const clearFilters = () => {
    setSearchTerm("");
    // setDescriptionFilter("");
    // setSelectedEntityId(null);
  };

  const startEditing = (entity, field) => {
    setEditingEntity(entity.id);
    setEntityBeingEdited(entity);
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

  const confirmDeleteEntity = async () => {
    if (entityToDelete) {
      try {
        // Delete entity from Supabase
        const { data, error } = await supabase
          .from("entities")
          .delete()
          .eq("id", entityToDelete.id);

        if (error) {
          console.error("Error deleting entity:", error);
          // Optionally, you can display an error message to the user
        } else {
          // Update local state to remove the deleted entity
          setEntityData((prevData) =>
            prevData.filter((entity) => entity.id !== entityToDelete.id)
          );
        }
      } catch (err) {
        console.error("Unexpected error during deletion:", err);
        // Optionally, handle unexpected errors here
      }

      closeDeleteDialog();
    }
  };

  const [editedEntityTypeValue, setEditedEntityTypeValue] = useState("");

  const startEditingEntityType = (entity) => {
    setEditingEntityType(entity.id);
    setEditedEntityTypeValue(entity.entity_type);
  };

  const handleEntityTypeBlur = async () => {
    // Save to Supabase
    const { data, error } = await supabase
      .from("entities")
      .update({ entity_type: editedEntityTypeValue })
      .eq("id", editingEntityType);

    if (!error) {
      // Update local state
      const updatedEntities = entityData.map((entity) => {
        if (entity.id === editingEntityType) {
          return { ...entity, entity_type: editedEntityTypeValue };
        }
        return entity;
      });

      setEntityData(updatedEntities);

      console.log("Successfully updated entity type");

      setEditingEntityType(null);
    } else {
      console.error("Error updating entity type:", error);
    }

    // Stop editing
    setEditingEntityType(null);
  };

  const isTruncated = (ref) => {
    const element = ref.current;
    console.log("Scroll Height: ", element.scrollHeight);
    console.log("Client Height: ", element.clientHeight);
    return element.scrollHeight > element.clientHeight;
  };

  return (
    <Container style={{ padding: 0 }}>
      <h2>User's Entities</h2>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <input
          type="checkbox"
          checked={showSubEntities}
          onChange={(e) => setShowSubEntities(e.target.checked)}
        />
        <label style={{ marginLeft: "10px" }}>Show all sub-entities</label>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {searchTerm && (
          <Button
            onClick={clearFilters}
            style={{ margin: 1, minWidth: "auto" }}
          >
            X
          </Button>
        )}
        <TextField
          label="By Name, Type, or Description"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div
        style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Entity Data */}
        {filteredData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((entity) => (
            <Grid
              container
              key={entity.id}
              spacing={3}
              alignItems="top"
              className="entityRow"
            >
              <hr className="customLine" />
              <Grid item xs={12} md={3} className="flexContainer">
                <div className="entityInfo ">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      className="entityName"
                      variant="h6"
                      onClick={() => setSelectedEntityId(entity.id)}
                      style={{ cursor: "pointer", marginRight: "10px" }}
                    >
                      {entity.name}
                    </Typography>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="material-icons edit-icons"
                        onClick={() => startEditing(entity, "name")}
                      >
                        edit
                      </span>

                      <span
                        className="material-icons delete-icons"
                        onClick={() => openDeleteDialog(entity)}
                      >
                        delete
                      </span>
                    </div>
                  </div>

                  {editingEntityType === entity.id ? (
                    <input
                      value={editedEntityTypeValue}
                      onChange={(e) => setEditedEntityTypeValue(e.target.value)}
                      onBlur={handleEntityTypeBlur}
                    />
                  ) : (
                    <div className="iconContainer">
                      <Typography
                        className="entityType"
                        variant="body2"
                        onClick={() => startEditingEntityType(entity)}
                      >
                        {entity.entity_type}
                      </Typography>
                    </div>
                  )}
                </div>
              </Grid>
              <Grid className="flexContainer" item xs={12} md={9}>
                <Typography
                  ref={descriptionRef}
                  onClick={() => {
                    if (expandedDescriptionId === entity.id) {
                      setExpandedDescriptionId(null); // collapse if it's already expanded
                    } else {
                      setExpandedDescriptionId(entity.id); // expand otherwise
                    }
                  }}
                  className={
                    expandedDescriptionId === entity.id
                      ? ""
                      : "truncate-multiline"
                  }
                  variant="body2"
                >
                  {entity.description}
                </Typography>
              </Grid>
            </Grid>
          ))}
      </div>
      <EditDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingEntity(null);
          setEntityBeingEdited(null);
        }}
        onSave={(newValue) => saveEditedEntity(newValue)}
        initialValue={
          entityBeingEdited
            ? fieldBeingEdited === "name"
              ? entityBeingEdited.name
              : entityBeingEdited.description
            : ""
        }
        onConfirmEdit={handleConfirmEdit}
        fieldBeingEdited={fieldBeingEdited}
      />
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {entityToDelete?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <span style={{ flex: "1 0 0" }} />
          <Button
            onClick={confirmDeleteEntity}
            variant="contained"
            color="secondary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Drawer Component */}
      <SearchDrawer searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    </Container>
  );
}

export default EntityTable;
