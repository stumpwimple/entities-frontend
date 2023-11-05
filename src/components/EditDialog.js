import React, { useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const EditDialog = ({
  isOpen,
  onClose,
  onSave,
  initialValue,
  fieldBeingEdited,
}) => {
  const [editedValue, setEditedValue] = useState(initialValue);
  const label = fieldBeingEdited
    ? fieldBeingEdited.charAt(0).toUpperCase() + fieldBeingEdited.slice(1)
    : "Name";
  useEffect(() => {
    setEditedValue(initialValue);
  }, [initialValue]);

  const handleConfirmAndSave = () => {
    onSave(editedValue); // Save the edited data
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth={true}>
      <DialogTitle>Edit Data</DialogTitle>
      <DialogContent>
        <TextField
          label={label}
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          fullWidth
          multiline
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirmAndSave} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
