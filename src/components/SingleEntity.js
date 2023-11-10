import {
  Container,
  Grid,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { useState, useContext, useEffect } from "react";
import EditDialog from "./EditDialog";
import supabase from "../supabaseClient";
import { DataContext } from "../DataContext";
import axios from "axios";
import "../App.css";
import ImageDialog from "./ImageDialog";
import { v4 as uuidv4 } from "uuid";
import {
  create_entity,
  generateArt,
  test_create_entity,
  uploadToBucket,
  verify_user,
} from "../apiUtils";

import {
  deleteEntity,
  moveEntity,
  removeEntityFromParent,
  extractRelevantEntities,
  handleMoveEntityLogic,
} from "./singleEntityHelpers";
import CampaignSearchDrawer from "./CampaignSearchDrawer";
import SubEntityCreationDialog from "./SubEntityCreationDialog";

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
    setUserCookie,
    userCookie,
  } = useContext(DataContext);
  const [editingPropertyIndex, setEditingPropertyIndex] = useState(null);
  const [editingPropertyName, setEditingPropertyName] = useState(null);
  const [parentEntity, setParentEntity] = useState(null);
  const [entity, setEntity] = useState(null);
  const [numberOfProperties, setNumberOfProperties] = useState(6);
  const [dialogState, setDialogState] = useState({
    open: false,
    content: "",
    title: "Entity Editing",
  });
  const [entityToDelete, setEntityToDelete] = useState(null);
  const [deletePropertyDialogOpen, setDeletePropertyDialogOpen] =
    useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyDescription, setNewPropertyDescription] = useState("");
  const [subEntityName, setSubEntityName] = useState("");
  const [subEntityType, setSubEntityType] = useState("");
  const [subEntityDescription, setSubEntityDescription] = useState("");
  const [isAddSubEntityDialogOpen, setIsAddSubEntityDialogOpen] =
    useState(false);

  const [editedEntityTypeValue, setEditedEntityTypeValue] = useState("");
  const [editingEntityType, setEditingEntityType] = useState(null);
  const [deleteEntityDialogOpen, setDeleteEntityDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedMoveEntity, setSelectedMoveEntity] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const { entities, disabledIds } = extractRelevantEntities(entity, entityData);
  const [searchTerm, setSearchTerm] = useState("");

  const [subEntityDialogOpen, setSubEntityDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [userCookieInput, setUserCookieInput] = useState(null);
  const [isInputActive, setInputActive] = useState(!userCookie);

  const [isImageButtonsVisible, setIsImageButtonsVisible] = useState(false);
  const [isUserAllowed, setIsUserAllowed] = useState(false);

  const toggleVisibility = () => {
    setIsImageButtonsVisible(!isImageButtonsVisible);
  };

  const handleOpenSubEntityDialog = (currentProperty) => {
    setSelectedProperty(currentProperty);
    setSubEntityDialogOpen(true);
  };

  const handleCloseSubEntityDialog = () => {
    setSelectedProperty(null);
    setSubEntityDialogOpen(false);
  };

  const handleOpenImageDialogButtonClick = (entity) => {
    setIsImageDialogOpen(true);
  };

  const createSubEntity = async (subEntityInfo) => {
    try {
      const response = await axios.post(
        "https://entities.fly.dev/generate-entity",
        //"http://localhost:5000/generate-entity",

        {
          entity_description: subEntityInfo,
          user_id: user,
          parent_id: selectedEntityId,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("Error details:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const test_createSubEntity = async (subEntityInfo) => {
    try {
      const response = await axios.post(
        "https://entities.fly.dev/test-generate-entity",
        //"http://localhost:5000/test-generate-entity",

        {
          entity_description: subEntityInfo,
          user_id: user,
          parent_id: selectedEntityId,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("Error details:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  };

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

  const filteredProperties =
    entity && entity.properties
      ? entity.properties.filter(
          (prop) =>
            prop.name.toLowerCase().includes(nameOrTypeFilter.toLowerCase()) ||
            prop.description
              .toLowerCase()
              .includes(nameOrTypeFilter.toLowerCase())
        )
      : [];

  const startEditing = (edit_entity, field, propertyIndex = null) => {
    setFieldBeingEdited(field);
    setEditingEntity(edit_entity.id);
    setIsDialogOpen(true);
    setEditingPropertyIndex(propertyIndex);
    if (field === "properties") {
      setEditedData(edit_entity.properties[propertyIndex].description);
    } else if (field === "name" || field === "sub_name") {
      setEditedData(edit_entity.name);
    } else if (field === "description") {
      setEditedData(edit_entity.description);
    }
  };

  function handleConfirmEdit(newValue) {
    setEditedData(newValue);
    saveEditedEntity();
  }

  const saveEditedEntity = async (newValue) => {
    const updatedData = {};
    if (fieldBeingEdited === "name" || fieldBeingEdited === "sub_name") {
      updatedData.name = newValue;
    } else if (fieldBeingEdited === "description") {
      updatedData.description = newValue;
    } else if (fieldBeingEdited === "properties") {
      // Assuming the structure of the entity is such that properties is an array of objects
      const updatedProperties = [...entity.properties];
      updatedProperties[editingPropertyIndex].description = newValue;
      updatedData.properties = updatedProperties;
    } else {
      console.log("field Error on entity with ID:", editingEntity);
    }

    const { data, error } = await supabase
      .from("entities")
      .update(updatedData)
      .eq("id", editingEntity);

    if (!error) {
      const updatedEntities = entityData.map((entity) => {
        if (entity.id === editingEntity) {
          let updatedEntity = { ...entity };
          if (fieldBeingEdited === "name" || fieldBeingEdited === "sub_name") {
            updatedEntity.name = newValue;
          } else if (fieldBeingEdited === "description") {
            updatedEntity.description = newValue;
          } else if (fieldBeingEdited === "properties") {
            updatedEntity.properties[editingPropertyIndex].description =
              newValue;
          }
          return updatedEntity;
        }
        return entity;
      });

      setEntityData(updatedEntities);

      setEditingEntity(null);
      setDialogState({
        open: true,
        content: "Entity updated successfully!",
        title: "Success",
      });
    } else {
      console.error("Error updating entity:", error);
      setDialogState({
        open: true,
        content: `Error: ${error.message}`,
        title: "Error",
      });
    }
  };

  const openDeleteDialog = (entity) => {
    setEntityToDelete(entity);
    setDeleteEntityDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setEntityToDelete(null);
    setDeleteEntityDialogOpen(false);
  };

  const openDeletePropertyDialog = (property) => {
    setPropertyToDelete(property);
    setDeletePropertyDialogOpen(true);
  };

  const closeDeletePropertyDialog = () => {
    setEntityToDelete(null);
    setDeletePropertyDialogOpen(false);
  };

  const confirmDeleteProperty = async () => {
    if (propertyToDelete) {
      // Create a copy of the existing properties
      const updatedProperties = entity.properties.filter(
        (prop) => prop.name !== propertyToDelete.name
      );

      // Update the entity's properties in the database
      const { data, error } = await supabase
        .from("entities")
        .update({ properties: updatedProperties })
        .eq("id", entity.id);

      if (!error) {
        // Update the local state
        const updatedEntities = entityData.map((e) => {
          if (e.id === entity.id) {
            return { ...e, properties: updatedProperties };
          }
          return e;
        });
        setEntityData(updatedEntities);
      } else {
        console.error("Error deleting property:", error);
      }

      // Close the delete dialog
      closeDeletePropertyDialog();
    }
  };

  useEffect(() => {
    if (entity && entity.id) {
      setSelectedMoveEntity(entity.id);
    }
  }, [entity]);

  const confirmDeleteEntity = async () => {
    if (entityToDelete) {
      const error = await deleteEntity(
        entityToDelete.id,
        entityData,
        setEntityData
      );
      if (error) {
        console.error("Error deleting entity:", error);
      }
      closeDeleteDialog();
    }
  };

  const handleAddProperty = async () => {
    if (newPropertyName && newPropertyDescription) {
      // Create a copy of the existing properties and add the new property
      const updatedProperties = [
        ...entity.properties,
        { name: newPropertyName, description: newPropertyDescription },
      ];

      // Update the entity's properties in the database
      const { data, error } = await supabase
        .from("entities")
        .update({ properties: updatedProperties })
        .eq("id", entity.id);

      if (!error) {
        // Update the local state
        const updatedEntities = entityData.map((e) => {
          if (e.id === entity.id) {
            return { ...e, properties: updatedProperties };
          }
          return e;
        });
        setEntityData(updatedEntities);
        // Clear the new property name and description
        setNewPropertyName("");
        setNewPropertyDescription("");
        // Close the add property dialog
        setIsAddPropertyDialogOpen(false);
      } else {
        console.error("Error adding property:", error);
      }
    } else {
      // You can show an error message or handle it in some way
      console.warn("Property name or description is missing");
    }
  };

  const clearFilters = () => {
    setNameOrTypeFilter("");
    setDescriptionFilter("");
    setSelectedEntityId(null);
  };

  const [editedPropertyNameValue, setEditedPropertyNameValue] = useState("");

  const startEditingPropertyName = (property, index) => {
    setEditingPropertyName(index);
    setEditedPropertyNameValue(property.name);
  };

  const handlePropertyNameBlur = async () => {
    const updatedProperties = [...entity.properties];
    updatedProperties[editingPropertyName].name = editedPropertyNameValue;

    const { data, error } = await supabase
      .from("entities")
      .update({ properties: updatedProperties })
      .eq("id", entity.id);

    if (!error) {
      const updatedEntities = entityData.map((e) => {
        if (e.id === entity.id) {
          return { ...e, properties: updatedProperties };
        }
        return e;
      });

      setEntityData(updatedEntities);
    } else {
      console.error("Error updating property name:", error);
    }

    setEditingPropertyName(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNumberOfProperties(value);
  };

  const handleCookieInputChange = (event) => {
    setUserCookieInput(event.target.value);
  };

  const handleSetClick = () => {
    if (isInputActive) {
      setUserCookie(userCookieInput);
      setInputActive(false);
    } else {
      setInputActive(true);
    }
  };

  useEffect(() => {
    if (entity) {
      const foundParentEntity = entityData.find(
        (e) => e.id === entity.parent_id
      );
      setParentEntity(foundParentEntity);
    }
  }, [entityData, entity]);

  useEffect(() => {
    const foundEntity = entityData.find((e) => e.id === selectedEntityId);
    setEntity(foundEntity);
  }, [entityData, selectedEntityId]);

  useEffect(() => {
    if (userCookie) {
      setInputActive(false); // Disable the input if userCookie exists
      setUserCookieInput(userCookie);
    }
  }, [userCookie]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await verify_user(user);
        const isUserVerified = response.data.isAllowed;
        if (isUserVerified) {
          setIsUserAllowed(true);
        }
      } catch (error) {
        console.error("An error occurred while verifying the user:", error);
      }
    };

    checkUser();
  }, [user]);

  if (!entity) {
    return <div>Entity not found</div>;
  }

  const startEditingEntityType = (edit_entity) => {
    setEditingEntityType(edit_entity.id);
    setEditedEntityTypeValue(edit_entity.entity_type);
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

      setEditingEntityType(null);
    } else {
      console.error("Error updating entity type:", error);
    }

    // Stop editing
    setEditingEntityType(null);
  };

  const handleMoveEntity = async () => {
    console.log("Moving entity:", entity.name, " to ", selectedMoveEntity.name);
    if (!selectedMoveEntity) return;

    // Use the moveEntity function from singleEntityHelpers.js
    const error = await moveEntity(entity, { id: selectedMoveEntity });
    if (!error) {
      // Assuming entityData is an array of entities
      const updatedEntities = entityData.map((thisEntity) => {
        if (entity.id === thisEntity.id) {
          return { ...thisEntity, parent_id: selectedMoveEntity };
        }
        return thisEntity;
      });
      setEntityData(updatedEntities);
    }

    setIsMoveDialogOpen(false);
  };

  const handleGenerateArtClick = async () => {
    console.log("Generating art for entity:", entity.name);

    const result = await generateArt(
      user,
      entity.id,
      entity.description.slice(0, 1000)
    );
  };

  return (
    <Container className="singleEntityContainer">
      <Grid container spacing={3} alignItems="top" className="entityRow">
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          justifyContent="space-between"
          className="entityRow"
        >
          <Typography variant="h4">{entity.name}</Typography>
          <Grid
            item
            direction="row"
            xs={1}
            alignItems="center"
            justifyContent="flex-end"
            className="noPadding"
          >
            {isImageButtonsVisible && (
              <>
                {/* <Tooltip
                  title="In order to use image generation you must enter your own Bing image creator key. To obtain, login to Bing Image Creator, hit F12, go to the application tab, in Storage find Cookies, find bing cookie, then find the entry row labeled '_U' and copy its value to the bing gen cookie input and hit set. If you don't have boost tokens available, the process may fail right now. This is a temporary solution until the Dalle3 API is released."
                  placement="top"
                  classes={{ tooltip: "tooltipLargeText" }}
                >
                  <span className="material-icons edit-icons">
                    help_outline
                  </span>
                </Tooltip>
                <Button onClick={handleSetClick}>Set</Button>
                <input
                  placeholder="bing gen cookie"
                  value={isInputActive ? userCookieInput : userCookie || ""}
                  onChange={handleCookieInputChange}
                  disabled={!isInputActive}
                /> */}
              </>
            )}

            {isUserAllowed && (
              <Button onClick={toggleVisibility} className="hiddenButton" />
            )}
          </Grid>
        </Grid>
        <Grid container spacing={3} alignItems="top" className="entityRow">
          <Typography variant="body1">{entity.entity_type}</Typography>
          {isImageButtonsVisible && (
            <Grid
              item
              container
              direction="column"
              xs={1}
              alignItems="flex-end"
              className="noPadding"
            >
              <Button
                onClick={() => handleOpenImageDialogButtonClick()}
                className="noMargin"
              >
                View Entity
              </Button>
            </Grid>
          )}
        </Grid>
        <ImageDialog
          open={isImageDialogOpen}
          onClose={() => setIsImageDialogOpen(false)}
          entity={entity}
          onGenerateArt={handleGenerateArtClick}
        />
        <hr className="customLine" />
        <>
          <Grid container spacing={3} alignItems="top" className="entityRow">
            <Grid className="noPadding" item xs={12} md={3}>
              <Typography variant="h6" className="propertyName">
                Parent:
              </Typography>
            </Grid>
            <Grid item className="noPadding" xs={12} md={9}>
              <Typography
                className="grid-container"
                variant="body1"
                onClick={() => {
                  setSelectedEntityId(parentEntity ? parentEntity.id : null);
                }}
                style={{ cursor: "pointer" }}
              >
                {parentEntity ? parentEntity.name : "Base Entity"} (click to go)
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsMoveDialogOpen(true);
                  }}
                >
                  MOVE ENTITY
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </>
        <hr className="customLine" />
        <Grid item xs={12} md={3} className="flexContainer">
          <Typography variant="h6" className="propertyName">
            Description
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography
            variant="body2"
            onClick={() => startEditing(entity, "description")}
            style={{ cursor: "pointer" }}
          >
            {entity.description}
          </Typography>

          <EditDialog
            isOpen={isDialogOpen && fieldBeingEdited !== "properties"}
            onClose={() => setIsDialogOpen(false)}
            onSave={(newValue) => saveEditedEntity(newValue)}
            initialValue={editedData}
            onConfirmEdit={handleConfirmEdit}
            fieldBeingEdited={fieldBeingEdited}
          />
        </Grid>
        <Grid container>
          <hr className="customLine" />
          {/* Filters */}
          <Grid item xs={3} md={3} />
          <Grid
            item
            xs={12}
            md={9}
            style={{ display: "flex", alignItems: "center" }}
            className="entityRow"
          >
            <Button
              onClick={clearFilters}
              style={{ margin: 2, minWidth: "auto" }}
            >
              X
            </Button>
            <TextField
              label="Filter by Description"
              variant="outlined"
              size="small"
              fullWidth
              value={nameOrTypeFilter}
              onChange={(e) => setNameOrTypeFilter(e.target.value)}
            />
          </Grid>
        </Grid>
        {/* Property Data */}{" "}
        <Grid container spacing={3} alignItems="top" className="entityRow">
          <Typography
            className="entityName"
            variant="h6"
            style={{ marginTop: "10px" }}
          >
            <strong>Entity Properties</strong>
          </Typography>
        </Grid>
        {filteredProperties.map((property, index) => (
          <>
            <hr className="customLine" />

            <Grid item xs={12} md={3} className="flexContainer">
              {editingPropertyName === index ? (
                <input
                  value={editedPropertyNameValue}
                  onChange={(e) => setEditedPropertyNameValue(e.target.value)}
                  onBlur={handlePropertyNameBlur}
                  autoFocus
                />
              ) : (
                <div className="entityInfo">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        {/* Cell for the property name */}
                        <td style={{ width: "100%", verticalAlign: "middle" }}>
                          <Typography
                            variant="h6"
                            className="propertyName"
                            onClick={() =>
                              startEditingPropertyName(property, index)
                            }
                          >
                            {property.name}
                          </Typography>
                        </td>
                        {/* Cell for the delete icon */}
                        <td style={{ verticalAlign: "middle" }}>
                          <span
                            className="material-icons delete-icons"
                            onClick={() => openDeletePropertyDialog(property)}
                            style={{ cursor: "pointer" }}
                          >
                            delete
                          </span>
                        </td>
                      </tr>
                      <tr>
                        {/* Cell for the + button. This spans 2 columns to cover the entire width */}
                        <td
                          colSpan={2}
                          style={{ verticalAlign: "middle", paddingTop: "4px" }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenSubEntityDialog(property)}
                          >
                            Make Sub-Entity
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <SubEntityCreationDialog
                    user={user}
                    fetchEntities={fetchEntities}
                    create_entity={createSubEntity}
                    test_create_entity={test_createSubEntity}
                    dialogOpen={subEntityDialogOpen}
                    setDialogOpen={setSubEntityDialogOpen}
                    entity={entity}
                    property={selectedProperty}
                    onClose={handleCloseSubEntityDialog}
                  />
                </div>
              )}
              <br />
            </Grid>
            <Grid item xs={12} md={9} className="flexContainer">
              <Typography
                variant="body2"
                className="propertyDescription"
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
        <hr className="customLine" />
        <Button
          variant="outlined"
          onClick={() => setIsAddPropertyDialogOpen(true)}
          style={{ margin: 4 }}
        >
          Add Property
        </Button>
      </Grid>

      <Grid container spacing={3} alignItems="top" className="entityRow">
        <Typography
          className="entityName"
          variant="h6"
          style={{ marginTop: "30px" }}
        >
          <strong>Sub-Entities</strong>
        </Typography>
      </Grid>
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
              <hr className="customLine" />
              <Grid item xs={12} md={3} className="flexContainer">
                <div className="entityInfo">
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
                      onClick={() => {
                        setSelectedEntityId(sub_entity.id);
                      }}
                      style={{ cursor: "pointer", marginRight: "10px" }}
                    >
                      {sub_entity.name}
                    </Typography>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="material-icons edit-icons"
                        onClick={() => {
                          startEditing(sub_entity, "sub_name");
                        }}
                      >
                        edit
                      </span>

                      <span
                        className="material-icons delete-icons"
                        onClick={() => openDeleteDialog(sub_entity)}
                      >
                        delete
                      </span>
                    </div>
                  </div>

                  {editingEntityType === sub_entity.id ? (
                    <input
                      value={editedEntityTypeValue}
                      onChange={(e) => setEditedEntityTypeValue(e.target.value)}
                      onBlur={handleEntityTypeBlur}
                    />
                  ) : (
                    <Typography
                      className="entityType"
                      variant="body2"
                      onClick={() => startEditingEntityType(sub_entity)}
                    >
                      {sub_entity.entity_type}
                    </Typography>
                  )}
                </div>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography
                  // className={
                  //   expandedDescriptionId === entity.id
                  //     ? ""
                  //     : "truncate-multiline"
                  // }
                  variant="body2"
                  onClick={() => startEditing(sub_entity, "description")}
                >
                  {sub_entity.description}
                </Typography>
              </Grid>
            </Grid>
          )
      )}

      <hr className="customLine" />
      <Button
        variant="outlined"
        style={{ margin: 4 }}
        onClick={() => {
          handleOpenSubEntityDialog("");
        }}
      >
        Add Sub-Entity
      </Button>

      <CampaignSearchDrawer
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Dialog
        open={dialogState.open}
        onClose={() =>
          setDialogState((prevState) => ({ ...prevState, open: false }))
        }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogState.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogState((prevState) => ({ ...prevState, open: false }))
            }
            color="primary"
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deletePropertyDialogOpen}
        onClose={closeDeletePropertyDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the property{" "}
            {propertyToDelete?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeletePropertyDialog} color="primary">
            Cancel
          </Button>
          <span style={{ flex: "1 0 0" }} />
          <Button
            onClick={confirmDeleteProperty}
            variant="contained"
            color="secondary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteEntityDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the entity {entityToDelete?.name}?
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

      <Dialog
        open={isAddPropertyDialogOpen}
        onClose={() => setIsAddPropertyDialogOpen(false)}
      >
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Property Name"
            fullWidth
            value={newPropertyName}
            onChange={(e) => setNewPropertyName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Property Description"
            fullWidth
            multiline
            rows={4}
            value={newPropertyDescription}
            onChange={(e) => setNewPropertyDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsAddPropertyDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleAddProperty} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAddSubEntityDialogOpen}
        onClose={() => setIsAddSubEntityDialogOpen(false)}
      >
        <DialogTitle>Add Sub-Entity</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={subEntityName}
            onChange={(e) => setSubEntityName(e.target.value)}
          />
          <TextField
            label="Type"
            fullWidth
            value={subEntityType}
            onChange={(e) => setSubEntityType(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={subEntityDescription}
            onChange={(e) => setSubEntityDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsAddSubEntityDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const subEntityInfo = `An entity of type ${subEntityType} with entity description ${subEntityDescription} and with ${numberOfProperties} properties. While generating the entity consider it's parent entity for context and background consideration.  parent name: ${entity.name}, parent summary ${entity.description}}`;
              createSubEntity(subEntityInfo);
              setIsAddSubEntityDialogOpen(false);
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
      >
        <DialogTitle>Move {entity.name} to where?</DialogTitle>
        <DialogContent>
          <Select
            value={selectedMoveEntity}
            onChange={(e) => setSelectedMoveEntity(e.target.value)}
          >
            {entities.map((entityItem) => {
              let entityRelationship = "";
              if (entityItem.id === entity.id) {
                entityRelationship = "(This Entity)";
              } else if (entityItem.id === entity.parent_id) {
                entityRelationship = "(Current Parent)";
              } else if (
                entityItem.parent_id === entity.parent_id &&
                entityItem.entity_type === entity.entity_type
              ) {
                entityRelationship = `(? Same Type, ${entity.entity_type})`;
              } else if (entityItem.parent_id === entity.parent_id) {
                entityRelationship = "(In Same Entity)";
              } else {
                entityRelationship = "(Lineage Entity)";
              }

              return (
                <MenuItem
                  key={entityItem.id}
                  value={entityItem.id}
                  disabled={disabledIds.includes(entityItem.id)}
                >
                  {entityItem.name} {entityRelationship}
                </MenuItem>
              );
            })}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMoveDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleMoveEntity}
            color="primary"
            disabled={disabledIds.includes(selectedMoveEntity)}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SingleEntity;
