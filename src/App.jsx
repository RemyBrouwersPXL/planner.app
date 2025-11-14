import React, { useState, useEffect , useCallback } from "react";
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

import {
  getWeekGoals, addWeekGoal, updateWeekGoal, deleteWeekGoal,
  getDayGoals, addDayGoal, updateDayGoal, deleteDayGoal
} from './services/goalsService';

function App() {
  

  function normalizeDate(date) {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0]; // 'YYYY-MM-DD'
  }

  



  



  // 🌙 Dark mode
  
  
  function getCurrentWeekKey() {
    const today = new Date();
    const year = today.getFullYear();
    const weekNumber = Math.ceil((((today - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${weekNumber}`;
  }
  function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) .. 6 (Sat)
  const monday = new Date(today);
  // if sunday (0), go back 6 days, else go back day-1 days
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getCurrentWeekStart());
  const [weekGoals, setWeekGoals] = useState([]);
  const [dayGoals, setDayGoals] = useState({});
  
  const [selectedDay, setSelectedDay] = useState(null);
  const currentWeekKey = getCurrentWeekKey();


 


  // 📝 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditGoal, setModalEditGoal] = useState(null);

  const [dayModalOpen, setDayModalOpen] = useState(false);
 
 

  useEffect(() => {
    let mounted = true;
    async function loadWeek() {
      try {
        const data = await getWeekGoals(currentWeekKey);
        if (!mounted) return;
        // ensure array
        setWeekGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Kon weekdoelen niet laden:", err);
        setWeekGoals([]);
      }
    }
    loadWeek();
    return () => {
      mounted = false;
    };
  }, [currentWeekKey]);

  useEffect(() => {
  if (!selectedDay) return;
  const normalizedDay = normalizeDate(selectedDay);
  async function loadDay() {
    try {
      const data = await getDayGoals(normalizedDay);
      console.log("dayGoals fetched:", normalizedDay, data); // << debug
      setDayGoals((prev) => ({ ...prev, [normalizedDay]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Kon dagdoelen niet laden:", err);
    }
  }
  loadDay();
}, [selectedDay]);

  // 🗓 Weeknavigatie
  const previousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const nextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getCurrentWeekStart());
  }, []);

  



  /* ---------- Week goal handlers (Supabase) ---------- */
  const addWeekGoalHandler = async (goal) => {
    try {
      // attach week_key
      const toInsert = { ...goal, week_key: currentWeekKey, completed: goal.completed ?? false };
      const data = await addWeekGoal(toInsert);
      // Supabase returns array of inserted rows
      if (Array.isArray(data)) {
        setWeekGoals((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error("addWeekGoal failed:", err);
    }
  };

  const updateWeekGoalHandler = async (id, updates) => {
    try {
      const data = await updateWeekGoal(id, updates);
      // optimistic update
      setWeekGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
      return data;
    } catch (err) {
      console.error("updateWeekGoal failed:", err);
    }
  };

  const deleteWeekGoalHandler = async (id) => {
    try {
      await deleteWeekGoal(id);
      setWeekGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("deleteWeekGoal failed:", err);
    }
  };

  /* ---------- Day goal handlers (Supabase) ---------- */
  const addDayGoalHandler = async (goal, date = selectedDay) => {
    try {
      const normalizedDate = normalizeDate(date);
      const toInsert = { ...goal, date: normalizedDate, completed: goal.completed ?? false };
      const data = await addDayGoal(toInsert);
      if (Array.isArray(data)) {
        setDayGoals((prev) => ({ ...prev, [normalizedDate]: [...(prev[normalizedDate] || []), ...data] }));
      }
    } catch (err) {
      console.error("addDayGoal failed:", err);
    }
  };

  const updateDayGoalHandler = async (id, updates) => {
    try {
      await updateDayGoal(id, updates);
      // optimistic
      setDayGoals((prev) => {
        const copy = { ...prev };
        if (!copy[selectedDay]) return copy;
        copy[selectedDay] = copy[selectedDay].map((g) => (g.id === id ? { ...g, ...updates } : g));
        return copy;
      });
    } catch (err) {
      console.error("updateDayGoal failed:", err);
    }
  };

  const deleteDayGoalHandler = async (id) => {
    try {
      await deleteDayGoal(id);
      setDayGoals((prev) => {
        const copy = { ...prev };
        if (!copy[selectedDay]) return copy;
        copy[selectedDay] = copy[selectedDay].filter((g) => g.id !== id);
        return copy;
      });
    } catch (err) {
      console.error("deleteDayGoal failed:", err);
    }
  };

  const toggleDayComplete = (dayKey, id) => {
    const list = dayGoals[dayKey] || [];
    const goal = list.find((g) => g.id === id);
    if (!goal) return;
    updateDayGoalHandler(id, { completed: !goal.completed });
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
          weekGoals={weekGoals}
          onUpdateGoal={updateWeekGoalHandler}
          onDeleteGoal={deleteWeekGoalHandler}

          openModal={()=>{ setModalEditGoal(null); setModalOpen(true); }}
        />

        {/* DagPlanner */}
        <DagPlanner
          currentWeekStart={currentWeekStart}
          dayGoals={dayGoals}
          openDayModal={(dayKey)=>{ setSelectedDay(dayKey); setDayModalOpen(true); }}
          openModal={(dayKey)=>{ setSelectedDay(dayKey); setModalEditGoal(null); setModalOpen(true); }}
        />

        {/* Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(goal) => {
            if (selectedDay) { 
              addDayGoalHandler(goal, selectedDay); 
            } else { 
              addWeekGoalHandler({ ...goal, week_key: currentWeekKey }); 
            }
            setModalOpen(false);
          }}
          editGoal={modalEditGoal}
        />


        
        <DayModal
          open={dayModalOpen}
          onClose={() => setDayModalOpen(false)}
          dayKey={selectedDay}
          dayGoals={dayGoals[selectedDay] || []}
          toggleDayComplete={toggleDayComplete}
          onDeleteGoal={deleteDayGoalHandler}
          openAddGoalModal={(dayKey)=>{ setSelectedDay(dayKey); setModalOpen(true); }}
          openEditGoalModal={(goal)=>{ setSelectedDay(goal.date); setModalEditGoal(goal); setModalOpen(true); }}
        
        />

      </Container>
    </ThemeProvider>
  );
}

export default App;
