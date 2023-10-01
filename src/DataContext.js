import React, { createContext, useState, useContext } from "react";

export const DataContext = createContext();

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    entityDescription: "",
  });

  const [user, setUser] = useState(null);

  const [entityData, setEntityData] = useState([]);

  const [selectedEntityId, setSelectedEntityId] = useState(null);

  return (
    <DataContext.Provider
      value={{
        formData,
        setFormData,
        entityData,
        setEntityData,
        user,
        setUser,
        selectedEntityId,
        setSelectedEntityId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
