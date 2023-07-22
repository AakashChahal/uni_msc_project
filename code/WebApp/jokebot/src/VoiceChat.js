import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    CssBaseline,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Close, Favorite, ModeCommentOutlined } from "@mui/icons-material";
import { MicRounded, MicOffRounded } from "@mui/icons-material";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

const VoiceChat = () => {
    const [currTheme, setCurrTheme] = useState("dark");
    const currThemeRef = React.useRef(currTheme);
    const [anchorEl, setAnchorEl] = useState(null);
    const [response, setResponse] = useState(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();
    const [error, setError] = useState(null);

    if (!browserSupportsSpeechRecognition) {
        setError("Speech recognition is not supported in your browser.");
    }

    useEffect(() => {
        currThemeRef.current = window.localStorage.getItem("theme") ?? "dark";
        setCurrTheme(currThemeRef.current);
    }, []);

    const theme = createTheme({
        palette: {
            mode: currTheme,
        },
    });

    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleChangeTheme = () => {
        currThemeRef.current =
            currThemeRef.current === "light" ? "dark" : "light";
        setCurrTheme(currThemeRef.current);
        window.localStorage.setItem("theme", currThemeRef.current);
    };

    const handleRespond = async () => {
        const response = await fetch(
            `http://aakashchahal.pythonanywhere.com/voice-chat/${transcript}`
        );
        const data = await response.json();
        setResponse(data.response);
        const utterance = new SpeechSynthesisUtterance(data.response);
        speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (!listening && transcript !== "") {
            handleRespond();
            resetTranscript();
        }
    }, [transcript, listening]);

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    display: "none",
                }}
            >
                <ModeCommentOutlined />
                <Favorite />
            </div>
            <CssBaseline />
            <Grid
                container
                component="main"
                sx={{
                    height: "100vh",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: "3rem",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        position: "fixed",
                        top: 0,
                        p: 2,
                    }}
                >
                    <IconButton
                        onClick={handleClickMenu}
                        sx={{
                            marginRight: "1rem",
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                        }}
                    >
                        <Avatar
                            src={
                                "https://img.icons8.com/material-outlined/32/" +
                                (currThemeRef.current === "light"
                                    ? "000000"
                                    : "ffffff") +
                                "/menu.png"
                            }
                            alt="Menu"
                        />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                window.location.href = "/";
                            }}
                        >
                            Chat
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                window.location.href =
                                    "/tweet-picture-generate";
                            }}
                        >
                            Tweet Picture Generation Page
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                console.log("Already here!");
                            }}
                        >
                            Voice Chat
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                handleChangeTheme();
                            }}
                        >
                            {currTheme === "dark" ? "Light Mode" : "Dark Mode"}
                        </MenuItem>
                    </Menu>
                    <Grid
                        item
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            width: "69.1vw",
                            "@media (max-width: 600px)": {
                                width: "66vw",
                            },
                        }}
                    >
                        {/* empty div for aligning menu button */}
                    </Grid>
                </Box>
                <Typography variant="h4" align="center">
                    JokeBot
                </Typography>
                <br />
                <Typography variant="h4" align="center">
                    Voice Chat
                </Typography>
                <br />
                <Grid
                    item
                    sx={{
                        height: "80vh",
                        width: "70vw",
                        "@media (max-width: 600px)": {
                            width: "100vw",
                            maxHeight: "70vh",
                        },
                    }}
                    xs={10}
                    sm={8}
                >
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                marginBottom: "1rem",
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {error}
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => setError(null)}
                                sx={{
                                    position: "absolute",
                                    top: "auto",
                                    bottom: "auto",
                                    right: 0,
                                    "&:hover": {
                                        backgroundColor: "transparent",
                                    },
                                }}
                            >
                                <Close fontSize="inherit" />
                            </IconButton>
                        </Alert>
                    )}
                    <Grid item>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                width: "100%",
                            }}
                        >
                            <Typography
                                variant="h5"
                                align="center"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {transcript}
                            </Typography>

                            {response && (
                                <Typography
                                    variant="h5"
                                    align="center"
                                    sx={{
                                        marginTop: "20%",
                                        whiteSpace: "pre-wrap",
                                        position: "absolute",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    {response}
                                </Typography>
                            )}

                            {listening ? (
                                <MicRounded
                                    sx={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "38%",
                                        transform: "translateX(-50%)",
                                        marginTop: "12rem",
                                        fontSize: "5em",
                                        color: "green",
                                        border: "1px solid",
                                        borderRadius: "50%",
                                        borderColor: "green",
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        SpeechRecognition.stopListening();
                                        resetTranscript();
                                    }}
                                />
                            ) : (
                                <MicOffRounded
                                    sx={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "38%",
                                        transform: "translateX(-50%)",
                                        marginTop: "12rem",
                                        fontSize: "5em",
                                        color: "red",
                                        border: "1px solid",
                                        borderRadius: "50%",
                                        borderColor: "red",
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setResponse(null);
                                        SpeechRecognition.startListening();
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default VoiceChat;
