import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Login from './components/Login';
import WeekPlanner from "./components/WeekPlanner";
import DagPlanner from "./components/DagPlanner";
import Modal from "./components/Modal";
import DayModal from "./components/DayModal";
import theme from "./theme";

import { supabase } from './supabaseClient';
import { getUser } from './services/authService';
import {
  getWeekGoals, addWeekGoal, updateWeekGoal, deleteWeekGoal,
  getDayGoals, addDayGoal, updateDayGoal, deleteDayGoal
} from './services/goalsService';

function App() {

  const normalizeDate = (date) => date ? new Date(date).toISOString().split("T")[0] : null;

  const getCurrentWeekKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const weekNumber = Math.ceil((((today - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${weekNumber}`;
  };

  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    return monday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getCurrentWeekStart());
  const [weekGoals, setWeekGoals] = useState([]);
  const [dayGoals, setDayGoals] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditGoal, setModalEditGoal] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentWeekKey = getCurrentWeekKey();

  

  // 🟢 User login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🟢 Weekdoelen ophalen
  const fetchWeekGoals = useCallback(async () => {
    try {
      const data = await getWeekGoals(currentWeekKey);
      setWeekGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Kon weekdoelen niet laden:", err);
      setWeekGoals([]);
    }
  }, [currentWeekKey]);

  // 🟢 Dagdoelen ophalen
  const fetchDayGoals = useCallback(async (day) => {
    if (!day) return;
    const normalizedDay = normalizeDate(day);
    try {
      const data = await getDayGoals(normalizedDay);
      setDayGoals(prev => ({ ...prev, [normalizedDay]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Kon dagdoelen niet laden:", err);
    }
  }, []);

  useEffect(() => {
    fetchWeekGoals();
  }, [currentWeekKey]);

  useEffect(() => {
    if (selectedDay) fetchDayGoals(selectedDay);
  }, [selectedDay]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await getUser();
      const loggedInUser = data?.user ?? null;
      setUser(loggedInUser);

      if (loggedInUser) {
        await fetchWeekGoals();
        if (selectedDay) await fetchDayGoals(selectedDay);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  // 🗓 Week navigatie
  const previousWeek = () => setCurrentWeekStart(prev => new Date(prev.setDate(prev.getDate() - 7)));
  const nextWeek = () => setCurrentWeekStart(prev => new Date(prev.setDate(prev.getDate() + 7)));
  const goToCurrentWeek = () => setCurrentWeekStart(getCurrentWeekStart());

  /* ---------- Week goal handlers ---------- */
  const addWeekGoalHandler = async (goal) => {
    try {
      const toInsert = { ...goal, week_key: currentWeekKey, completed: goal.completed ?? false };
      const { data, error } = await addWeekGoal(toInsert);
      if (error) throw error;
      setWeekGoals(prev => [...prev, ...(Array.isArray(data) ? data : [data])]);
    } catch (err) {
      console.error("addWeekGoal failed:", err);
    }
  };

  const updateWeekGoalHandler = async (id, updates) => {
    try {
      const { data, error } = await updateWeekGoal(id, updates);
      if (error) throw error;
      setWeekGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    } catch (err) {
      console.error("updateWeekGoal failed:", err);
    }
  };

  const deleteWeekGoalHandler = async (id) => {
    try {
      const { error } = await deleteWeekGoal(id);
      if (error) throw error;
      setWeekGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error("deleteWeekGoal failed:", err);
    }
  };

  /* ---------- Day goal handlers ---------- */
  const addDayGoalHandler = async (goal, date = selectedDay) => {
    if (!date) return;
    const normalizedDate = normalizeDate(date);
    const toInsert = { ...goal, date: normalizedDate, completed: goal.completed ?? false };

    try {
      const { data, error } = await addDayGoal(toInsert);
      if (error) throw error;
      // Geen interval nodig, realtime listener doet update
    } catch (err) {
      console.error("addDayGoal failed:", err);
    }
  };

  const updateDayGoalHandler = async (id, updates) => {
    try {
      const { error } = await updateDayGoal(id, updates);
      if (error) throw error;
      setDayGoals(prev => {
        const copy = { ...prev };
        if (!copy[selectedDay]) return copy;
        copy[selectedDay] = copy[selectedDay].map(g => g.id === id ? { ...g, ...updates } : g);
        return copy;
      });
    } catch (err) {
      console.error("updateDayGoal failed:", err);
    }
  };

  const deleteDayGoalHandler = async (id) => {
    try {
      const { error } = await deleteDayGoal(id);
      if (error) throw error;
      setDayGoals(prev => {
        const copy = { ...prev };
        if (!copy[selectedDay]) return copy;
        copy[selectedDay] = copy[selectedDay].filter(g => g.id !== id);
        return copy;
      });
    } catch (err) {
      console.error("deleteDayGoal failed:", err);
    }
  };

  const toggleDayComplete = (dayKey, id) => {
    const list = dayGoals[dayKey] || [];
    const goal = list.find(g => g.id === id);
    if (!goal) return;
    updateDayGoalHandler(id, { completed: !goal.completed });
  };

  // 🔴 Supabase realtime listener voor dagdoelen
  useEffect(() => {
    const channel = supabase
      .channel('day_goals_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'day_goals' },
        (payload) => {
          // payload check
          if (!payload) return;

          const { new: newGoal, old: oldGoal } = payload;

          setDayGoals(prev => {
            const copy = { ...prev };

            // INSERT of UPDATE
            if (newGoal && newGoal.date) {
              copy[newGoal.date] = [...(copy[newGoal.date] || []), newGoal];
            }

            // DELETE
            if (oldGoal && oldGoal.date && Array.isArray(copy[oldGoal.date])) {
              copy[oldGoal.date] = copy[oldGoal.date].filter(g => g.id !== oldGoal.id);
            }

            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);





  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        html: { minHeight: "100vh", backgroundAttachment: "fixed", overflowX: "hidden", WebkitBackgroundClip: "transparent" },
        body: { overflowX: "hidden", background: "linear-gradient(45deg, #FC466B, #3F5EFB)", height: "100%", fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", margin: 0, backgroundAttachment: "fixed" },
        "#root": { height: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }
      }} />

      <Container sx={{
        flex: 1, minHeight: "100vh", py: 4, display: "flex", flexDirection: "column", justifyContent: "flex-start",
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", overflowX: "hidden"
      }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: "bold", color: "linear-gradient(90deg, #00f5a0, #00d9f5)", WebkitBackgroundClip: "text", background: "transparent" }}>
          Mijn Planner
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2, flexWrap: "wrap", background: "transparent" }}>
          <Button variant="outlined" onClick={previousWeek}>Vorige week</Button>
          <Button variant="contained" onClick={goToCurrentWeek}>Huidige week</Button>
          <Button variant="outlined" onClick={nextWeek}>Volgende week</Button>
        </Box>

        <WeekPlanner
          weekGoals={weekGoals}
          onUpdateGoal={updateWeekGoalHandler}
          onDeleteGoal={deleteWeekGoalHandler}
          openModal={() => { setModalEditGoal(null); setModalOpen(true); }}
        />

        <DagPlanner
          currentWeekStart={currentWeekStart}
          dayGoals={dayGoals}
          openDayModal={dayKey => { setSelectedDay(dayKey); setDayModalOpen(true); }}
          openModal={goal => { setSelectedDay(goal.date); setModalEditGoal(goal); setModalOpen(true); }}
          setSelectedDay={setSelectedDay}
        />

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={goal => {
            if (selectedDay) addDayGoalHandler(goal, selectedDay);
            else addWeekGoalHandler(goal);
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
          openAddGoalModal={dayKey => { setSelectedDay(dayKey); setModalOpen(true); }}
          openEditGoalModal={goal => { setSelectedDay(goal.date); setModalEditGoal(goal); setModalOpen(true); }}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
