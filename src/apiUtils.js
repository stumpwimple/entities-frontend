import axios from "axios";

export const create_entity = async (
  user,
  entityType,
  subEntities,
  entityDescription,
  fetchEntities
) => {
  console.log("entityDescription:", entityDescription);
  const modified_description =
    "type is " +
    entityType +
    ": with " +
    subEntities +
    " properties, and the following entity description" +
    entityDescription;

  try {
    const response = await axios.post(
      "https://entities.fly.dev/generate-entity",
      // "http://localhost:5000/generate-entity",
      {
        entity_description: modified_description,
        user_id: user,
        parent_id: "00000000-0000-0000-0000-000000000000",
      }
    );

    // await fetchEntities();

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Error detailzzz:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const test_create_entity = async (
  user,
  entityType,
  subEntities,
  entityDescription,
  fetchEntities
) => {
  const modified_description =
    "type is " +
    entityType +
    ": with " +
    subEntities +
    "properties, and the following entity description" +
    entityDescription;

  try {
    const response = await axios.post(
      "https://entities.fly.dev/test-generate-entity",
      //"http://localhost:5000/test-generate-entity",
      {
        entity_description: modified_description,
        user_id: user,
        parent_id: "00000000-0000-0000-0000-000000000000",
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.log("Error detailzzz:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
