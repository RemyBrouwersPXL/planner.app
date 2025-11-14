import React from "react";
import { Grid, Card, CardContent, Typography, Fab, Box, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Height } from "@mui/icons-material";

function DagPlanner({ currentWeekStart, dayGoals, openDayModal, openModal }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return {
      key: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
      }),
    };
  });

  const priorityColor = (priority) => {
    switch (priority) {
      case "Hoog":
        return "#FF3D3D";
      case "Normaal":
        return "#FFD93D";
      case "Laag":
        return "#6BCB77";
      default:
        return "#CCCCCC";
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontFamily: "'Orbitron', sans-serif",
          color: "#6C63FF",
          textShadow: "0 0 10px #6C63FF",
        }}
      >
        Dagplanner
      </Typography>

      <Grid container spacing={2} justifyContent="center" alignItems="stretch">
        {days.map((day) => (
          <Grid key={day.key} item xs={12} sm={6} md={3}>
            <Card
              sm={{
                p: 2,
                alignItems: "stretch",
                Height: "100%",
                borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 0 20px #6C63FF",
                },
              }}
              onClick={() => openDayModal(day.key)}
            >
              <CardContent sx={{ flexGrow: 1, alignItems: "stretch", display: "flex", flexDirection: "column", justifyContent: "space-between", width: 175, fontFamily: "'Orbitron', sans-serif", color: "#74ffc8ff", textShadow: "0 0 10px #6C63FF", borderRadius: 3, Height: "100%",}}>
                <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                  {day.label}
                </Typography>

                {/* 🎯 Alleen titel tonen — klik opent detailmodal */}
                {(dayGoals[day.key] || []).map((goal) => (
                  <Card
                    key={goal.id}
                    onClick={() => openDetailModal(goal, "day", day.key)}
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderRadius: 3,
                      background: goal.completed
                        ? "linear-gradient(135deg, #00F5FF, #6BCB77)"
                        : "rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-3px)" },
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold" align="center">
                      {goal.title}
                    </Typography>
                    <Chip
                      label={goal.priority}
                      sx={{
                        mt: 0.5,
                        bgcolor: priorityColor(goal.priority),
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        display: "block",
                        margin: "4px auto 0",
                      }}
                    />
                  </Card>
                ))}

                {/* ➕ Nieuwe doel toevoegen */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Fab
                    size="medium"
                    sx={{
                      background: "linear-gradient(45deg, #6C63FF, #00F5FF)",
                      color: "#fff",
                      "&:hover": { boxShadow: "0 0 20px #00F5FF" },
                    }}
                    onClick={(e) => {e.stopPropagation(); openModal(day.key)}}
                  >
                    <AddIcon />
                  </Fab>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DagPlanner;
