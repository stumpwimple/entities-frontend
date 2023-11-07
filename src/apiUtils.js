import axios from "axios";

export const create_entity = async (
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
    console.log("Error details:", error.message);
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
    console.log("Error details:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const verify_user = async (user) => {
  const this_user = user;
  try {
    const response = await axios.post(
      "https://entities.fly.dev/verify-user",
      //"http://localhost:5000/verify-user",
      {
        user_id: user,
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

export const generateArt = async (description, user_cookie) => {
  const modified_description = description;

  try {
    const response = await axios.post(
      "https://entities.fly.dev/generate-image",
      //"http://localhost:5000/generate-image",
      {
        entity_description: modified_description,
        user_cookie: user_cookie,
      }
    );
    console.log(response.data);
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

export const uploadToBucket = async (user, imageUrl) => {
  try {
    // Fetch the image data from the imageUrl
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image for upload.");
    }
    const blob = await imageResponse.blob();

    // Upload the blob to your bucket
    const uploadResponse = await fetch("https://your-bucket-api/upload", {
      method: "POST",
      // You might need to set specific headers, like authorization
      body: blob,
      // If your API expects a FormData, you would prepare it like so:
      // const formData = new FormData();
      // formData.append('file', blob, 'image.png');
      // And then send formData as the body
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload to bucket failed");
    }

    const uploadData = await uploadResponse.json();
    return uploadData.bucketUrl; // The URL where the image is stored in the bucket
  } catch (error) {
    // Handle or throw the error appropriately
    console.error("Error uploading to bucket:", error);
    throw error;
  }
};
