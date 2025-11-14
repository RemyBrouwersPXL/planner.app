import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  useTheme,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

function DayModal({
  open,
  onClose,
  dayKey,
  dayGoals,
  toggleDayComplete,
  onDeleteGoal,
  openEditGoalModal,
  openAddGoalModal,
}) {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component={Paper}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          p: 4,
          width: "90%",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        {/* Plus knop */}
        <IconButton
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            color: "#fff",
            "&:hover": {
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
          onClick={() => openAddGoalModal(dayKey)}
        >
          <AddIcon />
        </IconButton>

        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {dayKey}
        </Typography>

        <Stack spacing={2} mt={4}>
          {dayGoals.map((goal) => (
            <Box
              key={goal.id}
              sx={{
                p: 2,
                borderRadius: 2,
                background: theme.palette.background.paper,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>{goal.title}</Typography>
                <Chip
                  label={goal.priority}
                  sx={{
                    bgcolor: theme.palette.priority[goal.priority?.toLowerCase()] || "#ccc",
                    mt: 0.5,
                  }}
                />
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => toggleDayComplete(dayKey, goal.id)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => openEditGoalModal(goal)}
                />
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDeleteGoal(goal.id)}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Modal>
  );
}

export default DayModal;