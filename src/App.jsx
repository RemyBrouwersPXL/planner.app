import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, GlobalStyles  } from "@mui/material";

import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import WeekPlanner from "./components/WeekPlanner";
import DagPlanner from "./components/DagPlanner";
import Modal from "./components/Modal";
import DayModal from "./components/DayModal";
import theme from "./theme"

function App() {
  // 🌙 Dark mode
  const [darkMode, setDarkMode] = useState(false);
  
  

  // 📅 Huidige week start (maandag)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    return monday;
  });

  // 🎯 State: week- en dagdoelen (per week)
  const [weekGoals, setWeekGoals] = useState(() => {
    const stored = localStorage.getItem("weekGoals");
    return stored ? JSON.parse(stored) : {};
  });
  const [dayGoals, setDayGoals] = useState(() => {
    const stored = localStorage.getItem("dayGoals");
    return stored ? JSON.parse(stored) : {};
  });

  // 📝 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState({ type: "", date: null });

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);


  // ⏳ Opslaan in LocalStorage
  useEffect(() => {
    localStorage.setItem("weekGoals", JSON.stringify(weekGoals));
  }, [weekGoals]);

  useEffect(() => {
    localStorage.setItem("dayGoals", JSON.stringify(dayGoals));
  }, [dayGoals]);

  // 🗓 Weeknavigatie
  const previousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };
  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };
  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    setCurrentWeekStart(monday);
  };

  const getWeekKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const currentWeekKey = getWeekKey(currentWeekStart);

  // 🎯 Weekdoelen functies
  const addWeekGoal = (goal) => {
  setWeekGoals((prev) => {
    const updated = { ...prev };

    if (!updated[currentWeekKey]) updated[currentWeekKey] = [];

    updated[currentWeekKey].push({
      id: Date.now().toString(),
      title: goal.title,
      description: goal.description,
      priority: goal.priority || "Normaal",
      completed: false,
    });

    // Sla alleen non-empty arrays op
    Object.keys(updated).forEach((key) => {
      if (updated[key].length === 0) delete updated[key];
    });

    
    return updated;
  });
};

  const toggleWeekComplete = (goalId) => {
    setWeekGoals((prev) => {
      const updated = { ...prev };
      updated[currentWeekKey] = updated[currentWeekKey].map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      );
      return updated;
    });
  };

  const deleteWeekGoal = (goalId) => {
  setWeekGoals((prev) => {
    const updated = { ...prev };
    
    updated[currentWeekKey] = updated[currentWeekKey].filter((g) => g.id !== goalId);

    // Verwijder lege weken
    if (updated[currentWeekKey].length === 0) delete updated[currentWeekKey];

    
    return updated;
  });
};

  // 🎯 Dagdoelen functies
  const addDayGoal = (date, goal) => {
    setDayGoals((prev) => {
      const updatedGoals = { ...prev };

      if (!updatedGoals[date]) updatedGoals[date] = [];


      updatedGoals[date].push({
      id: Date.now().toString(),
      title: goal.title,
      description: goal.description,
      priority: goal.priority || "Normaal",
      completed: false,
    });


    Object.keys(updatedGoals).forEach((key) => {
      if (updatedGoals[key].length === 0) delete updatedGoals[key];
    });     
      
      return updatedGoals;
    });
  };

  const toggleDayComplete = (date, goalId) => {
    setDayGoals((prev) => {
      const updated = { ...prev };
      updated[date] = updated[date].map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      );
      return updated;
    });
  };

  const deleteDayGoal = (date, goalId) => {
    setDayGoals((prev) => {
      const updated = { ...prev };
      updated[date] = updated[date].filter((g) => g.id !== goalId);

      if (updated[date].length === 0) {
      delete updated[date];
    }
      return updated;
    });
  };



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <GlobalStyles styles={{
        html: { minHeight: "100vh",
          backgroundAttachment: "fixed",
          overflowx: "hidden",
          WebkitBackgroundClip: "transparent",
         },
          body: {
            overflowx: "hidden",
            background: "linear-gradient(45deg, #FC466B, #3F5EFB)",
            height: "100%",
            fontFamily: "'Montserrat', sans-serif",
            minHeight: "100vh",
            margin: 0,
            backgroundAttachment: "fixed",
            
          },
          "#root": {
            height: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          },

        }} />

      <Container 
sx={{
        flex: 1,
        minHeight: "100vh",
        py: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        overflowx: "hidden",
      }}
>
        <Typography variant="h3" align="center" gutterBottom sx={{
          
          fontWeight: "bold",
          color: "linear-gradient(90deg, #00f5a0, #00d9f5)",
          WebkitBackgroundClip: "text",
          background: "transparent",

        }}>
          Mijn Planner
        </Typography>

        {/* Donker/licht modus */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2, flexWrap:"wrap", background: "transparent"  }}>
          {/* Week navigatie */}
          <Button variant="outlined" 
               onClick={previousWeek}>
            Vorige week
          </Button>
          <Button variant="contained" onClick={goToCurrentWeek}>
            Huidige week
          </Button>
          <Button variant="outlined" onClick={nextWeek}>
            Volgende week
          </Button>
        </Box>

        {/* WeekPlanner */}
        <WeekPlanner
          weekGoals={weekGoals[currentWeekKey] || []}
          toggleComplete={toggleWeekComplete}
          deleteWeekGoal={deleteWeekGoal}
          openModal={() => {
            setModalContext({ type: "week" });
            setModalOpen(true);
          }}
        />

        {/* DagPlanner */}
        <DagPlanner
          currentWeekStart={currentWeekStart}
          dayGoals={dayGoals}
          openDayModal={(dayKey) => { setSelectedDay(dayKey); setDayModalOpen(true); }}
        />

        {/* Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(goal) => {
            if (modalContext.type === "week") {
              if (modalContext.editGoal) {
                // Bewerken van bestaande weekdoel
                setWeekGoals(prev => {
                  const updated = { ...prev };
                  updated[currentWeekKey] = updated[currentWeekKey].map(g =>
                    g.id === modalContext.editGoal.id ? { ...g, ...goal } : g
                  );
                  return updated;
                });
              } else {
                addWeekGoal(goal);
              }
            }

            if (modalContext.type === "day") {
              if (modalContext.editGoal) {
                // Bewerken van bestaande dagdoel
                setDayGoals(prev => {
                  const updated = { ...prev };
                  updated[modalContext.date] = updated[modalContext.date].map(g =>
                    g.id === modalContext.editGoal.id ? { ...g, ...goal } : g
                  );
                  return updated;
                });
              } else {
                addDayGoal(modalContext.date, goal);
              }
            }

            setModalOpen(false);
            setModalContext({ type: "", date: null });
          }}
          editGoal={modalContext.editGoal || null}
        />

        
        <DayModal
          open={dayModalOpen}
          onClose={() => setDayModalOpen(false)}
          dayKey={selectedDay}
          dayGoals={dayGoals[selectedDay] || []}
          toggleDayComplete={toggleDayComplete}
          deleteDayGoal={deleteDayGoal}
          editDayGoal={(goal) => { 
              setModalContext({ type: "day", date: selectedDay, editGoal: goal }); 
              setModalOpen(true); 
          }}
          openAddGoalModal={(dayKey) => {
              setModalContext({ type: "day", date: dayKey }); 
              setModalOpen(true);
          }}
        />

      </Container>
    </ThemeProvider>
  );
}

export default App;
