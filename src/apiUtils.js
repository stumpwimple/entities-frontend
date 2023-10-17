import axios from "axios";

export const create_entity = async (
  user,
  entityType,
  subEntities,
  formData,
  setDialogState,
  fetchEntities
) => {
  setDialogState({
    open: true,
    content: "Creating entity...",
    title: "Entity Creation",
  });

  const modified_description =
    "type is " +
    entityType +
    ": with " +
    subEntities +
    "properties, and the following entity description" +
    formData.entityDescription;

  try {
    const response = await axios.post(
      "https://entities.fly.dev/generate-entity",
      // "http://localhost:5000/generate-entity",
      {
        entity_description: modified_description,
        // entity_type: formData.entityType,
        // sub_entities: formData.subEntities,
        user_id: user,
        parent_id: "00000000-0000-0000-0000-000000000000",
      }
    );
    console.log(response.data);

    await fetchEntities();

    setDialogState({
      open: true,
      content: "Entity created successfully!",
      title: "Success",
    });
  } catch (error) {
    console.error("Error details:", error.message);
    setDialogState({
      open: true,
      content: `Error, Don't panic, Do try again: ${error.message}`,
      title: "Error",
    });
  }

  setTimeout(
    () => setDialogState((prevState) => ({ ...prevState, open: false })),
    2000
  );
};

export const test_create_entity = async (
  user,
  entityType,
  subEntities,
  formData,
  setDialogState,
  fetchEntities
) => {
  setDialogState({
    open: true,
    content: "Creating test entity...",
    title: "Entity Creation",
  });

  const modified_description =
    "type is " +
    entityType +
    ": with " +
    subEntities +
    "properties, and the following entity description" +
    formData.entityDescription;

  try {
    const response = await axios.post(
      "https://entities.fly.dev/test-generate-entity",
      // "http://localhost:5000/test-generate-entity",
      {
        entity_description: modified_description,
        // entity_type: formData.entityType,
        // sub_entities: formData.subEntities,
        user_id: user,
        parent_id: "00000000-0000-0000-0000-000000000000",
      }
    );
    console.log(response.data);

    await fetchEntities();

    setDialogState({
      open: true,
      content: "Entity created successfully!",
      title: "Success",
    });
  } catch (error) {
    console.error("Error details:", error.message);
    setDialogState({
      open: true,
      content: `Error, Don't panic, Do try again: ${error.message}`,
      title: "Error",
    });
  }

  setTimeout(
    () => setDialogState((prevState) => ({ ...prevState, open: false })),
    3000
  );
};
