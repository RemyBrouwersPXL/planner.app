import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  MenuItem,
  useTheme,
} from "@mui/material";

function Modal({ open, onClose, onSave, editGoal }) {
  const theme = useTheme();
  const [title, setTitle] = useState(editGoal?.title || "");
  const [description, setDescription] = useState(editGoal?.description || "");
  const [priority, setPriority] = useState(editGoal?.priority || "Normaal");

  useEffect(() => {
    setTitle(editGoal?.title || "");
    setDescription(editGoal?.description || "");
    setPriority(editGoal?.priority || "Normaal");
  }, [editGoal]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, priority, completed: false });
    setTitle("");
    setPriority("Normaal");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          fontWeight: "bold",
          background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
        }}
      >
        Nieuw doel toevoegen
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Titel"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          select
          label="Prioriteit"
          fullWidth
          sx={{ mb: 2 }}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="Hoog">Hoog</MenuItem>
          <MenuItem value="Normaal">Normaal</MenuItem>
          <MenuItem value="Laag">Laag</MenuItem>
        </TextField>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            mt: 2,
            borderRadius: "50px",
            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            color: "#fff",
            "&:hover": {
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          Opslaan
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;