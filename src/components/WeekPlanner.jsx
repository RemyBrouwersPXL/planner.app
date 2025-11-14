import React from "react";
import { Card, CardContent, Typography, Fab, Box, LinearProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function WeekPlanner({ weekGoals, onAddGoal, onUpdateGoal, onDeleteGoal, openModal }) {
  const completedCount = weekGoals.filter((g) => g.completed).length;
  const progress = (completedCount / (weekGoals.length || 1)) * 100;

  return (
    <Card
      sx={{
        mb: 4,
        position: "relative",
        p: 3,
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        color: "#fff",
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "'Orbitron', sans-serif",
            textAlign: "center",
            color: "#00F5FF",
            textShadow: "0 0 10px #00F5FF",
          }}
        >
          Weekplanner
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 3,
            height: 12,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #6C63FF, #00F5FF)",
            },
          }}
        />

        {weekGoals.length === 0 && (
          <Typography variant="body2" sx={{ color: "#ccc", textAlign: "center" }}>
            Nog geen doelen toegevoegd.
          </Typography>
        )}

        {weekGoals.map((goal) => (
          <Card
            key={goal.id}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
              background: goal.completed
                ? "linear-gradient(135deg, #00F5FF, #6BCB77)"
                : "rgba(255,255,255,0.1)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 0 20px #00F5FF",
              },
            }}
          >
            <Typography variant="h6">{goal.title}</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Fab
                size="small"
                sx={{
                  background: goal.completed
                    ? "linear-gradient(45deg, #6BCB77, #00F5FF)"
                    : "linear-gradient(45deg, #6C63FF, #00F5FF)",
                  color: "#fff",
                  "&:hover": { boxShadow: "0 0 15px #00F5FF" },
                }}
                onClick={() => onUpdateGoal(goal.id, { completed: !goal.completed })}>
              
                ✓
              </Fab>
              <Fab
                size="small"
                sx={{
                  background: "linear-gradient(45deg, #FF6B6B, #FF3D3D)",
                  color: "#fff",
                  "&:hover": { boxShadow: "0 0 15px #FF6B6B" },
                }}
                onClick={() => onDeleteGoal(goal.id)}
              >
                ✕
              </Fab>
              


            </Box>
          </Card>
        ))}

        <Fab
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "linear-gradient(45deg, #6C63FF, #00F5FF)",
            color: "#fff",
            "&:hover": { boxShadow: "0 0 20px #00F5FF" },
          }}
          onClick={openModal}
        >
          <AddIcon />
        </Fab>
      </CardContent>
    </Card>
  );
}

export default WeekPlanner;