import supabase from "../supabaseClient";

export const deleteEntity = async (entityId, entityData, setEntityData) => {
  const { error } = await supabase
    .from("entities")
    .delete()
    .match({ id: entityId });

  if (!error) {
    // Update the local state
    const updatedEntities = entityData.filter((e) => e.id !== entityId);
    setEntityData(updatedEntities);
  } else {
    console.error("Error deleting entity:", error);
  }

  return error;
};

export const moveEntity = async (entity, newParentEntity) => {
  console.log("entity:", entity);
  console.log("newParentEntity:", newParentEntity);
  if (!newParentEntity) return;
  const { error } = await supabase
    .from("entities")
    .update({ parent_id: newParentEntity.id })
    .eq("id", entity.id);
  if (error) console.error("Error moving:", error);
};

export const removeEntityFromParent = async (entityId) => {
  const { error } = await supabase
    .from("entities")
    .update({ parent_id: null })
    .eq("id", entityId);
  if (error) console.error("Error removing from parent:", error);
};

export const fetchEntityData = async (id) => {
  const { data, error } = await supabase
    .from("entities")
    .select("*")
    .eq("id", id)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching entity data:", error);
  }
  return data;
};

export const updateEntityInDB = async (id, updates) => {
  const { data, error } = await supabase
    .from("entities")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("Error updating entity in database:", error);
  }
  return data;
};

export const deleteEntityFromDB = async (id) => {
  const { data, error } = await supabase.from("entities").delete().eq("id", id);
  if (error) {
    console.error("Error deleting entity:", error);
  }
  return data;
};

export const closeDeletePropertyDialog = async (
  setEntityToDelete,
  setDeletePropertyDialogOpen
) => {
  setEntityToDelete(null);
  setDeletePropertyDialogOpen(false);
};

export const openDeletePropertyDialog = async (
  property,
  setPropertyToDelete,
  setDeletePropertyDialogOpen
) => {
  setPropertyToDelete(property);
  setDeletePropertyDialogOpen(true);
};

export const startEditingPropertyName = async (
  property,
  index,
  setEditingPropertyName,
  setEditedPropertyNameValue
) => {
  setEditingPropertyName(index);
  setEditedPropertyNameValue(property.name);
};

export const startEditingEntityType = async (
  edit_entity,
  setEditingEntityType,
  setEditedEntityTypeValue
) => {
  setEditingEntityType(edit_entity.id);
  setEditedEntityTypeValue(edit_entity.entity_type);
};

export const closeDeleteDialog = async (
  setEntityToDelete,
  setDeleteEntityDialogOpen
) => {
  setEntityToDelete(null);
  setDeleteEntityDialogOpen(false);
};

export const extractRelevantEntities = (currentEntity, entityData) => {
  if (!currentEntity) {
    console.warn("currentEntity is null or undefined.");
    return { entities: [], disabledIds: [] };
  }
  console.log("currentEntity:", currentEntity);
  let relevantEntities = [];

  // Extract all parent lineage up to the Base Entity
  let parentId = currentEntity.parent_id;
  console.log("parentId:", parentId);
  while (parentId && parentId != "00000000-0000-0000-0000-000000000000") {
    const parentEntity = entityData.find((e) => e.id === parentId);
    if (!parentEntity) {
      console.warn(
        "Parent entity with ID:",
        parentId,
        "not found in entityData."
      );
      break;
    }

    relevantEntities.push(parentEntity);
    parentId = parentEntity.parent_id; // Set to parents parent_id
  }

  relevantEntities.reverse();

  // Extract sub-entities with the same parent as the current entity
  const subEntities = entityData.filter(
    (e) => e.parent_id === currentEntity.parent_id
  );
  console.log("subEntities:", subEntities);
  relevantEntities = [...relevantEntities, ...subEntities];

  return {
    entities: relevantEntities,
    disabledIds: [currentEntity.id, currentEntity.parent_id],
  };
};

export const handleMoveEntityLogic = async (
  currentEntity,
  selectedMoveEntity,
  entityData
) => {
  if (!selectedMoveEntity) return;

  // Use the moveEntity function
  const error = await moveEntity(currentEntity, { id: selectedMoveEntity });
  if (!error) {
    // Assuming entityData is an array of entities
    const updatedEntities = entityData.map((entity) => {
      if (entity.id === currentEntity.id) {
        return { ...entity, parent_id: selectedMoveEntity };
      }
      return entity;
    });
    return updatedEntities;
  } else {
    console.error("Error moving entity:", error);
    return entityData;
  }
};
