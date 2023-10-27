import React, { useEffect, useState, useContext } from "react";
import {
  TextField,
  Button,
  makeStyles,
  Typography,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { DataContext } from "../DataContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import supabase from "../supabaseClient";

const useStyles = makeStyles({
  root: {
    position: "fixed",
    left: "15%",
    width: "70vw",
    height: "40vh",
    maxWidth: "1000px",
    maxHeight: "600px",
    border: "15px solid #6b5640", // Thicker brown border
    backgroundColor: "#fff", // White background for the entire drawer
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    cursor: "pointer",
    zIndex: 9999,
    transition:
      "bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  leftPage: {
    flex: "50%",
    backgroundColor: "#fff", // White background for the left page
    padding: "16px 32px", // More padding on the left side
    borderRight: "3px solid gray", // Vertical lines to imply pages
    borderLeft: "15px solid black", // Thicker brown border
  },
  rightPage: {
    flex: "50%",
    backgroundColor: "#f0f0f0", // Light gray background for the right page
    padding: "16px",
    borderLeft: "3px solid gray", // Vertical lines to imply pages
  },
  content: {
    textAlign: "left",
    marginTop: "8px",
  },
  searchField: {
    height: "40px",
    "& .MuiInputBase-root": {
      height: "40px",
      fontSize: "14px",
    },
  },
  filterText: {
    fontSize: "14px",
    marginTop: "2px",
  },

  clickableTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30px",
    backgroundColor: "transparent",
    cursor: "pointer",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      backgroundColor: "rgba(200, 200, 200, 0.5)", // light gray with 50% opacity
    },
  },
  clickableText: {
    fontWeight: "bold",
  },
});

const findTopParent = (entityId, entityData) => {
  if (!entityData) {
    return null; // or appropriate default/fallback value
  }
  console.log("Finding top parent of:", entityId);
  let currentEntity = entityData.find((entity) => entity.id === entityId);

  while (
    currentEntity &&
    currentEntity.parent_id !== "00000000-0000-0000-0000-000000000000"
  ) {
    console.log(
      "Current entity",
      currentEntity.id,
      " has parent:",
      currentEntity.parent_id
    );
    currentEntity = entityData.find(
      (entity) => entity.id === currentEntity.parent_id
    );
  }
  console.log("Top parent is:", currentEntity);
  return currentEntity;
};

function flattenHierarchy(entityData, selectedEntityId) {
  let flattenedData = [];

  function traverseHierarchy(parentId, depth = 0) {
    const children = entityData.filter(
      (entity) => entity.parent_id === parentId
    );

    children.forEach((child) => {
      // Add the child to the flattened data with an additional depth attribute
      flattenedData.push({ ...child, depth: depth });
      // Recursively traverse its children
      traverseHierarchy(child.id, depth + 1);
    });
  }

  // Get the topmost parent of the selectedEntityId
  const topParent = findTopParent(selectedEntityId, entityData);
  if (!topParent) {
    return [];
  }
  // Start traversing from the topmost parent
  traverseHierarchy(topParent.id);
  return flattenedData;
}

function CampaignSearchDrawer({ searchTerm, setSearchTerm }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 'sm' is for small screens, you can adjust as needed

  const { entityData, setEntityData, selectedEntityId, setSelectedEntityId } =
    useContext(DataContext);

  const [flattenedEntityData, setFlattenedEntityData] = useState([]);

  useEffect(() => {
    console.log("useEffect is running...");
    if (entityData && entityData.length > 0) {
      setFlattenedEntityData(flattenHierarchy(entityData, selectedEntityId));
    }
  }, [entityData, selectedEntityId]);

  const classes = useStyles({ expanded });

  const bottomPosition = expanded ? "5vh" : "-38vh";
  const scaleTransform = expanded ? "scale(1.2)" : "scale(1)"; // 20% bigger when expanded

  const updateEntityOrder = async (entityId, order) => {
    const { error } = await supabase
      .from("entities")
      .update({ order: order })
      .eq("id", entityId);

    if (error) {
      console.error("Error updating entity order:", error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(flattenedEntityData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    console.log("reorderedItem", reorderedItem);
    console.log("items", items);

    // Update order in the database for only the moved entity
    updateEntityOrder(reorderedItem.id, result.destination.index);

    // Update local state
    const updatedEntityData = entityData.map((item) => {
      if (item.id === reorderedItem.id) {
        console.log(
          "the item to update",
          item,
          " to ",
          result.destination.index
        );

        return { ...item, order: result.destination.index };
      }
      return item;
    });
    setFlattenedEntityData(flattenHierarchy(items, selectedEntityId));

    setEntityData(updatedEntityData);
    // console.log("Entity Data: ", entityData);
  };

  const getChildrenRecursively = (parentId) => {
    const children = entityData.filter(
      (entity) => entity.parent_id === parentId
    );

    // Recursively retrieve children of children
    return children.map((child) => ({
      ...child,
      children: getChildrenRecursively(child.id),
    }));
  };

  // const getChildren = (parentId) => {
  //   return entityData.filter((entity) => entity.parent_id === parentId);
  // };

  const topParent = findTopParent(selectedEntityId);

  const childrenOfTopParent = topParent
    ? getChildrenRecursively(topParent.id)
    : [];

  const renderEntity = (entity, index) => (
    <Draggable key={entity.id} draggableId={entity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginLeft: `${entity.depth * 0.5}rem`,
            backgroundColor: snapshot.isDragging ? "lightgreen" : "white",
          }}
          onClick={() => {
            setSelectedEntityId(entity.id);
          }}
        >
          {entity.name}
        </div>
      )}
    </Draggable>
  );

  const renderHierarchy = (flattenedEntities) => (
    <Droppable droppableId="droppableEntityList">
      {(provided) => (
        <ul
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{ listStyleType: "none", padding: 0, textAlign: "left" }}
        >
          {flattenedEntities.map((entity, index) =>
            renderEntity(entity, index)
          )}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );

  return (
    <div
      className={classes.root}
      style={{
        bottom: bottomPosition,
        transform: scaleTransform,
      }}
    >
      <div
        className={classes.clickableTop}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="caption" className={classes.clickableText}>
          {expanded ? "Close Tome ( X )" : "Open Tome --- ( ^ )"}
        </Typography>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={classes.leftPage}>
          <Typography variant="subtitle1" className={classes.filterText}>
            <strong>Entity Table of Contents</strong>
          </Typography>
          <div
            className={classes.content}
            style={{ marginTop: "10px", height: "520px", overflowY: "auto" }}
          >
            {expanded && renderHierarchy(flattenedEntityData)}
          </div>
        </div>
        {!isMobile && (
          <div className={classes.rightPage}>
            {/* Content for the right page */}
            {/* {tempSearchTerm && (
          <Button
            size="small"
            variant="standard"
            onClick={(e) => {
              e.stopPropagation();
              setTempSearchTerm("");
              setSearchTerm("");
            }}
            style={{
              marginRight: 2,
              marginLeft: 2,
              padding: 2,
              minHeight: 25,
              minWidth: 25,
              verticalAlign: "bottom",
              position: "relative",
              bottom: "-6px",
            }}
          >
            X
          </Button>
        )}
        <TextField
          label="Search"
          variant="standard"
          value={tempSearchTerm}
          onChange={(e) => {
            setTempSearchTerm(e.target.value);
            if (autoSearch) {
              setSearchTerm(e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Search by name, type, or description"
          className={classes.searchField}
        />
        <Button
          style={{ marginTop: "14px", fontSize: "14px", padding: "4px 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            setSearchTerm(tempSearchTerm);
          }}
        >
          Scry
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoSearch}
              onChange={() => setAutoSearch(!autoSearch)}
              onClick={(e) => {
                e.stopPropagation();
                setSearchTerm(tempSearchTerm);
              }}
            />
          }
          label="Auto"
          style={{ marginLeft: "8px", marginTop: "8px" }}
        />*/}
          </div>
        )}
      </DragDropContext>
    </div>
  );
}

export default CampaignSearchDrawer;
