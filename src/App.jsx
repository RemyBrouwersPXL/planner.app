import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, GlobalStyles  } from "@mui/material";

import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { messaging } from './firebase';
import { getToken, onMessage } from "firebase/messaging";

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
  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if(permission === 'granted'){
    const token = await getToken(messaging, { vapidKey: "VAPID_KEY_HIER" });
    console.log("FCM Token:", token);
    // Stuur token naar jouw backend of Supabase
    }
  }

  requestPermission();

// Ontvang realtime berichten
  onMessage(messaging, (payload) => {
    console.log('Message received: ', payload);
  });

  function useDailyNotification() {
    useEffect(() => {
      // Controleer of browser notificaties ondersteunt
      if (!("Notification" in window)) return;

      // Vraag toestemming bij eerste keer openen
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      // Functie om te checken of het 20:00 is en een notificatie te sturen
      const checkTime = () => {
        const now = new Date();
        if (now.getHours() === 20 && now.getMinutes() === 0) {
          new Notification("Dagelijkse check", {
            body: "Heb je je doelen van vandaag voltooid?",
          });
        }
      };

      // Check elke minuut
      const interval = setInterval(checkTime, 60000);

      return () => clearInterval(interval); // cleanup bij unmount
    }, []);
  }

  // 🌙 Dark mode
  useDailyNotification();
  
  function getCurrentWeekKey() {
    const today = new Date();
    const year = today.getFullYear();
    const weekNumber = Math.ceil((((today - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${weekNumber}`;
  }

const [weekGoals, setWeekGoals] = useState([]);
  const [dayGoals, setDayGoals] = useState([]);
  const [currentWeekKey, setCurrentWeekKey] = useState(getCurrentWeekKey());
  const [selectedDay, setSelectedDay] = useState(null);


 


  // 📝 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditGoal, setModalEditGoal] = useState(null);

  const [dayModalOpen, setDayModalOpen] = useState(false);
 


  useEffect(()=>{
    async function fetchWeekGoals(){ setWeekGoals(await getWeekGoals(currentWeekKey.toISOString().split("T")[0])); }
    fetchWeekGoals();
  }, [currentWeekKey]);

  useEffect(()=>{
    if(selectedDay){
      async function fetchDayGoals(){
        const data = await getDayGoals(selectedDay);
        setDayGoals(prev => ({...prev, [selectedDay]: data}));
      }
      fetchDayGoals();
    }
  }, [selectedDay]);

  // 🗓 Weeknavigatie
  const previousWeek = () => {
    const prev = new Date(currentWeekKey);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };
  const nextWeek = () => {
    const next = new Date(currentWeekKey);
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

  



  const handleAddWeekGoal = async(goal)=>{ const data = await addWeekGoal(goal); setWeekGoals(prev=>[...prev,...data]); }
  const handleUpdateWeekGoal = async(id, updates)=>{ await updateWeekGoal(id, updates); setWeekGoals(prev=>prev.map(g=>g.id===id?{...g,...updates}:g)); }
  const handleDeleteWeekGoal = async(id)=>{ await deleteWeekGoal(id); setWeekGoals(prev=>prev.filter(g=>g.id!==id)); }

  const handleAddDayGoal = async(goal)=>{ const data = await addDayGoal(goal); setDayGoals(prev=>({...prev, [selectedDay]: [...(prev[selectedDay]||[]), ...data]})); }
  const handleUpdateDayGoal = async(id, updates)=>{ await updateDayGoal(id, updates); setDayGoals(prev=>({...prev, [selectedDay]: prev[selectedDay].map(g=>g.id===id?{...g,...updates}:g)})); }
  const handleDeleteDayGoal = async(id)=>{ await deleteDayGoal(id); setDayGoals(prev=>({...prev, [selectedDay]: prev[selectedDay].filter(g=>g.id!==id)})); }

  const toggleDayComplete = (dayKey, id)=>{
    const goal = dayGoals[dayKey].find(g=>g.id===id);
    handleUpdateDayGoal(id, {completed: !goal.completed});
  }




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
          onUpdateGoal={handleUpdateWeekGoal}
          onDeleteGoal={handleDeleteWeekGoal}

          openModal={()=>{ setModalEditGoal(null); setModalOpen(true); }}
        />

        {/* DagPlanner */}
        <DagPlanner
          currentWeekStart={currentWeekKey}
          dayGoals={dayGoals}
          openDayModal={(dayKey)=>{ setSelectedDay(dayKey); setDayModalOpen(true); }}
          openModal={(dayKey)=>{ setSelectedDay(dayKey); setModalEditGoal(null); setModalOpen(true); }}
        />

        {/* Modal */}
        <Modal
          open={modalOpen}
          onClose={()=>setModalOpen(false)}
          onSave={(goal)=>{
            if(selectedDay){ handleAddDayGoal({...goal, date:selectedDay}) }
            else{ handleAddWeekGoal({...goal, week_key: currentWeekKey.toISOString().split("T")[0]}) }
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
          onDeleteGoal={handleDeleteDayGoal}
          openAddGoalModal={(dayKey)=>{ setSelectedDay(dayKey); setModalOpen(true); }}
          openEditGoalModal={(goal)=>{ setSelectedDay(goal.date); setModalEditGoal(goal); setModalOpen(true); }}
        
        />

      </Container>
    </ThemeProvider>
  );
}

export default App;
