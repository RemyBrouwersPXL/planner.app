// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import WeekPlanner from "./components/WeekPlanner";
import DagPlanner from "./components/DagPlanner";
import Modal from "./components/Modal";
import DayModal from "./components/DayModal";
import theme from "./theme";

import {
  getWeekGoals,
  addWeekGoal,
  updateWeekGoal,
  deleteWeekGoal,
  getDayGoals,
  addDayGoal,
  updateDayGoal,
  deleteDayGoal,
} from "./services/goalsService";

/**
 * App.jsx - cleaned, robust version
 *
 * Key points:
 * - currentWeekStart is a Date object (used for calendar calculations)
 * - getWeekKey(date) returns a stable string key for Supabase (e.g. "2025-W46")
 * - dayGoals stored as object: { "2025-11-14": [{..}, ...], ... }
 * - modal flow:
 *    - modalOpen + modalEditGoal used for the standard add/edit modal
 *    - dayModalOpen + selectedDay used for per-day modal
 * - all Supabase calls handled async + update local state
 * - notifications hook included (frontend-only daily notification if app open)
 */

/* -------------------- Helpers -------------------- */

// returns monday of current week as Date
function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) .. 6 (Sat)
  const monday = new Date(today);
  // if sunday (0), go back 6 days, else go back day-1 days
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

// returns a week-key string for storing in DB
function getWeekKey(date) {
  // ISO-like week key: "YYYY-WWW" but simple: year + week number
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday-based ISO week algorithm
  const target = new Date(d.valueOf());
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${target.getFullYear()}-W${weekNumber}`;
}

// format date (YYYY-MM-DD) for day keys
function dateKeyFromDate(date) {
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // "2025-11-14"
}

/* -------------------- Notifications hook (frontend-only) -------------------- */
function useDailyNotification() {
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 20 && now.getMinutes() === 0) {
        // only if permission granted
        if (Notification.permission === "granted") {
          new Notification("Dagelijkse check", {
            body: "Heb je je doelen van vandaag voltooid?",
            renotify: true,
          });
        }
      }
    };
    const interval = setInterval(checkTime, 60 * 1000); // every minute
    return () => clearInterval(interval);
  }, []);
}

/* -------------------- App Component -------------------- */
export default function App() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getCurrentWeekStart());
  const [weekGoals, setWeekGoals] = useState([]); // goals for current week
  const [dayGoals, setDayGoals] = useState({}); // { "2025-11-14": [goal, ...], ... }

  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"
  const [modalOpen, setModalOpen] = useState(false); // standard add/edit modal
  const [modalEditGoal, setModalEditGoal] = useState(null); // goal object when editing
  const [dayModalOpen, setDayModalOpen] = useState(false); // per-day modal

  useDailyNotification();

  const currentWeekKey = getWeekKey(currentWeekStart);

  /* ---------- Fetch week goals whenever week changes ---------- */
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

  /* ---------- Fetch day goals whenever selectedDay opens ---------- */
  useEffect(() => {
    if (!selectedDay) return;
    let mounted = true;
    async function loadDay() {
      try {
        const data = await getDayGoals(selectedDay);
        if (!mounted) return;
        setDayGoals((prev) => ({ ...prev, [selectedDay]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error("Kon dagdoelen niet laden:", err);
      }
    }
    loadDay();
    return () => {
      mounted = false;
    };
  }, [selectedDay]);

  /* ---------- Week navigation ---------- */
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
      const toInsert = { ...goal, date: date, completed: goal.completed ?? false };
      const data = await addDayGoal(toInsert);
      if (Array.isArray(data)) {
        setDayGoals((prev) => ({ ...prev, [date]: [...(prev[date] || []), ...data] }));
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

  /* ---------- Modal flows ---------- */
  // open standard modal to create a week goal
  const openAddWeekModal = () => {
    setModalEditGoal(null);
    setModalOpen(true);
  };

  // open standard modal to create a day goal for specific date
  const openAddDayModal = (date) => {
    setSelectedDay(date);
    setModalEditGoal(null);
    setModalOpen(true);
  };

  // open modal to edit an existing goal (week or day). goal must include id and date/week_key if day
  const openEditGoalModal = (goal, type = "day") => {
    setModalEditGoal(goal);
    if (type === "day") {
      // ensure selectedDay set so save knows where to persist
      setSelectedDay(goal.date || dateKeyFromDate(goal.created_at || new Date()));
    }
    setModalOpen(true);
  };

  // when standard modal saves
  const handleModalSave = async (goalData) => {
    // if we're editing (modalEditGoal exists) -> update
    if (modalEditGoal?.id) {
      // determine if it's day or week by presence of date or week_key in editGoal
      if (modalEditGoal.date) {
        await updateDayGoalHandler(modalEditGoal.id, { ...goalData });
      } else {
        await updateWeekGoalHandler(modalEditGoal.id, { ...goalData });
      }
      setModalEditGoal(null);
      setModalOpen(false);
      return;
    }

    // creating new
    if (selectedDay) {
      // add day goal
      await addDayGoalHandler(goalData, selectedDay);
    } else {
      // add week goal
      await addWeekGoalHandler(goalData);
    }
    setModalOpen(false);
  };

  /* ---------- UI theme and layout ---------- */
  const appTheme = createTheme(theme);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { minHeight: "100%", height: "100%" },
          body: {
            minHeight: "100%",
            margin: 0,
            background: "linear-gradient(45deg,#FC466B,#3F5EFB)",
            fontFamily: "'Montserrat', sans-serif",
            WebkitFontSmoothing: "antialiased",
          },
          "#root": { minHeight: "100%", display: "flex", flexDirection: "column" },
        }}
      />

      <Container
        sx={{
          flex: 1,
          minHeight: "100vh",
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflowX: "hidden",
        }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ color: "#fff" }}>
          Mijn Planner
        </Typography>

        {/* Week navigation */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button variant="outlined" onClick={previousWeek}>
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
          onUpdateGoal={(id, updates) => updateWeekGoalHandler(id, updates)}
          onDeleteGoal={(id) => deleteWeekGoalHandler(id)}
          openModal={() => {
            setSelectedDay(null); // ensure we're adding a week goal
            openAddWeekModal();
          }}
        />

        {/* DagPlanner */}
        <DagPlanner
          currentWeekStart={currentWeekStart}
          dayGoals={dayGoals}
          openDayModal={(dayKey) => {
            setSelectedDay(dayKey);
            setDayModalOpen(true);
          }}
          openModal={(dayKey) => openAddDayModal(dayKey)}
        />

        {/* Standard Add/Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalEditGoal(null);
          }}
          onSave={handleModalSave}
          editGoal={modalEditGoal}
        />

        {/* Day modal: shows all goals for selectedDay */}
        <DayModal
          open={dayModalOpen}
          onClose={() => {
            setDayModalOpen(false);
            setSelectedDay(null);
          }}
          dayKey={selectedDay}
          dayGoals={dayGoals[selectedDay] || []}
          toggleDayComplete={(dayKey, id) => toggleDayComplete(dayKey, id)}
          onDeleteGoal={async (id) => {
            await deleteDayGoalHandler(id);
          }}
          openAddGoalModal={(dayKey) => {
            setSelectedDay(dayKey);
            setModalEditGoal(null);
            setModalOpen(true);
          }}
          openEditGoalModal={(goal) => {
            openEditGoalModal(goal, "day");
          }}
        />
      </Container>
    </ThemeProvider>
  );
}
