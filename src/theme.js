import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3F5EFB" },
    secondary: { main: "#FC466B" },
    background: {
      default: "transparent",
      paper: "rgba(255,255,255,0.1)",
    },
    text: { primary: "#fff" },
    backgroundAttachment: "fixed",
    
priority: {
      hoog: "#FF3D3D",
      normaal: "#FFD93D",
      laag: "#6BCB77",
    },

  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    h6: { fontWeight: 500 },
    button: { fontWeight: 500 },
  },
  components: {
    
MuiDialog: {
    styleOverrides: {
      paper: {
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      },
    },
  },

    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "20px 20px 40px rgba(0,0,0,0.2)",
        },
      },
    },
    
        MuiButton: {
            styleOverrides: {
                root: {
                borderRadius: "50px",
                padding: "12px 24px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "4px 4px 20px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                    background: "linear-gradient(45deg, #FC466B, #3F5EFB)",
                    transform: "scale(1.05)",
                    boxShadow: "6px 6px 25px rgba(0,0,0,0.4)",
                },
                },
            },
            },

    MuiInputBase: {
      styleOverrides: {
        root: {
          background: "transparent",
          borderRadius: "50px",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
          padding: "10px 20px",
          backdropFilter: "blur(5px)",
          boxShadow: "4px 4px 60px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});

export default theme;
