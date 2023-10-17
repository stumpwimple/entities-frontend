import React, { useState } from "react";
import Button from "@material-ui/core/Button";

const EntityCreationForm = ({
  user,
  fetchEntities,
  create_entity,
  test_create_entity,
  entityTypes,
  initialFormData = { entityDescription: "" },
  initialEntityType = "",
  initialSubEntities = 6,
  setDialogState,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [entityType, setEntityType] = useState(initialEntityType);
  const [subEntities, setSubEntities] = useState(initialSubEntities);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "entityType") {
      setEntityType(value);
    } else if (name === "subEntities") {
      setSubEntities(value);
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div>
      <button
        onClick={(event) => {
          if (event.ctrlKey) {
            test_create_entity(
              user,
              entityType,
              subEntities,
              formData,
              setDialogState,
              fetchEntities
            );
            console.log("ctrl key pressed");
          } else {
            create_entity(
              user,
              entityType,
              subEntities,
              formData,
              setDialogState,
              fetchEntities
            );
          }
        }}
      >
        Create Entity
      </button>

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
        name="subEntities"
        value={subEntities}
        onChange={handleInputChange}
      >
        <option value="3">3 properties</option>
        <option value="6">6 properties</option>
        <option value="9">9 properties</option>
      </select>
      <br />
      <textarea
        type="text"
        id="description"
        name="entityDescription"
        className="entityDescription"
        value={formData.entityDescription}
        onChange={handleInputChange}
        placeholder="Describe the Entity you want to create, in as little or much detail as you'd like."
      />
    </div>
  );
};

export default EntityCreationForm;
