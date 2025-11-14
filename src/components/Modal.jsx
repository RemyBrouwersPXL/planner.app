import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem } from "@mui/material";

function Modal({ open, onClose, onSave, editGoal }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Normaal");

  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setPriority(editGoal.priority);
    } else {
      setTitle("");
      setPriority("Normaal");
    }
  }, [editGoal]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...editGoal, title, priority, completed: editGoal?.completed || false });
    setTitle("");
    setPriority("Normaal");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editGoal ? "Doel bewerken" : "Nieuw doel"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Titel"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          select
          label="Prioriteit"
          fullWidth
          margin="normal"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="Hoog">Hoog</MenuItem>
          <MenuItem value="Normaal">Normaal</MenuItem>
          <MenuItem value="Laag">Laag</MenuItem>
        </TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2, width: "100%" }}
        >
          Opslaan
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
