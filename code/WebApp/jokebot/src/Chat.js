import React, { useEffect, useState, useRef } from "react";
import {
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Switch,
    Box,
    CssBaseline,
    Grid,
    Menu,
    MenuItem,
    Avatar,
    IconButton,
} from "@mui/material";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const Chat = () => {
    const [currTheme, setCurrTheme] = useState(
        window.localStorage.getItem("theme") ?? "dark"
    );
    const currThemeRef = useRef(window.localStorage.getItem("theme") ?? "dark");

    const [saveMessages, setSaveMessages] = useState(
        window.localStorage.getItem("saveMessages") === "true"
    );
    const saveMessagesRef = useRef(
        window.localStorage.getItem("saveMessages") === "true"
    );
    const theme = createTheme({
        palette: {
            mode: currTheme,
        },
    });
    const [messages, setMessages] = useState([]);
    const messagesRef = useRef([]);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClickAvatar = (event) => {
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

    const fetch_response = async (message, context = {}) => {
        messagesRef.current = [
            ...messagesRef.current,
            { text: "typing...", sender: "JokeBot" },
        ];
        setMessages(messagesRef.current);
        const contextJSON = JSON.stringify(context);
        const contextEncoded = encodeURIComponent(contextJSON);
        const contextBase64 = btoa(contextEncoded);
        const promptEncoded = encodeURIComponent(message);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        try {
            const response = await fetch(
                `https://aakashchahal.pythonanywhere.com/response/${promptEncoded}/${encodeURIComponent(
                    contextBase64
                )}`
            );
            const data = await response.json();
            const text = data.response;
            // remove any words that starts with # in the response
            const words = text.split(" ");
            const filteredWords = words.filter((word) => !word.startsWith("#"));
            const botResponse = filteredWords.join(" ");
            // var msg = new SpeechSynthesisUtterance();
            // msg.text = botResponse;
            // window.speechSynthesis.speak(msg);
            messagesRef.current.pop();
            messagesRef.current = [
                ...messagesRef.current,
                { text: botResponse, sender: "JokeBot" },
            ];
            setMessages(messagesRef.current);
            if (saveMessagesRef.current) {
                // Save messages to local storage
                window.localStorage.setItem(
                    "messages",
                    JSON.stringify(messagesRef.current)
                );
            }
        } catch (err) {
            console.error(err);
            messagesRef.current.pop();
            messagesRef.current = [
                ...messagesRef.current,
                {
                    text: "Sorry, I am unable to connect to the server. Please try again later.",
                    sender: "JokeBot",
                },
            ];
            setMessages(messagesRef.current);
        }
    };

    const handleSendMessage = (event) => {
        const message = document.getElementById("message").value;
        if (messagesRef.current.length > 0) {
            const lastMessage =
                messagesRef.current[messagesRef.current.length - 1];
            if (
                lastMessage.sender === "JokeBot" &&
                lastMessage.text ===
                    "Sorry, I am unable to connect to the server. Please try again later."
            ) {
                messagesRef.current.pop();
            }

            if (
                lastMessage.sender === "JokeBot" &&
                lastMessage.text === "typing..."
            ) {
                return;
            }

            if (message === "") {
                return;
            }
        }
        const context = {};
        messagesRef.current.forEach((message) => {
            if (message.sender === "You") {
                context["User"] = message.text;
            } else {
                context["You"] = message.text;
            }
        });
        const newMessages = [
            ...messagesRef.current,
            { text: message, sender: "You" },
        ];
        setMessages(newMessages);
        messagesRef.current = newMessages;
        if (Object.keys(context).length > 0) {
            fetch_response(message, context);
        } else {
            fetch_response(message);
        }
        document.getElementById("message").value = "";
        if (saveMessagesRef.current) {
            window.localStorage.setItem(
                "messages",
                JSON.stringify(messagesRef.current)
            );
        }
    };

    const handleSaveMessages = () => {
        saveMessagesRef.current = !saveMessagesRef.current;
        setSaveMessages(saveMessagesRef.current);
        window.localStorage.setItem("saveMessages", saveMessagesRef.current);
        if (saveMessagesRef.current) {
            window.localStorage.setItem(
                "messages",
                JSON.stringify(messagesRef.current)
            );
        } else {
            window.localStorage.removeItem("messages");
        }
    };

    useEffect(() => {
        currThemeRef.current = window.localStorage.getItem("theme") ?? "dark";
        const messages = JSON.parse(window.localStorage.getItem("messages"));
        saveMessagesRef.current =
            window.localStorage.getItem("saveMessages") === "true"
                ? true
                : false;
        if (messages) {
            setMessages(messages);
            messagesRef.current = messages;
        }

        window.addEventListener("beforeunload", (event) => {
            event.preventDefault();
            if (!saveMessagesRef.current && messagesRef.current.length > 0) {
                event.returnValue = "";
                return "";
            }
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Grid
                container
                component="main"
                sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    height: "100vh",
                    flexDirection: "column",
                    // position: "fixed",
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
                        onClick={handleClickAvatar}
                        sx={{
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
                                window.location.href = "/voice-chat";
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
                        {/* add a menu item only for mobile screens */}
                        <MenuItem
                            sx={{
                                "@media (min-width: 900px)": {
                                    display: "none",
                                },
                            }}
                        >
                            <Typography variant="body1" align="center">
                                Save Messages
                            </Typography>
                            <Switch
                                checked={saveMessages}
                                onChange={handleSaveMessages}
                                inputProps={{ "aria-label": "controlled" }}
                            />
                        </MenuItem>
                    </Menu>
                    <Grid
                        item
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            width: "70vw",
                            "@media (max-width: 899px)": {
                                marginLeft: "200%",
                            },
                        }}
                    >
                        <Typography variant="body1" align="center">
                            Save Messages
                        </Typography>
                        <Switch
                            checked={saveMessages}
                            onChange={handleSaveMessages}
                            inputProps={{ "aria-label": "controlled" }}
                        />
                    </Grid>
                </Box>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        "@media (max-width: 899px)": {
                            fontSize: "1.5rem",
                        },
                        "@media (max-height: 690px)": {
                            fontSize: "1.5rem",
                        },
                    }}
                >
                    JokeBot
                </Typography>
                <br />
                <Typography
                    variant="h5"
                    align="center"
                    sx={{
                        "@media (max-width: 899px)": {
                            fontSize: "1rem",
                        },
                        "@media (max-height: 690px)": {
                            fontSize: "1rem",
                        },
                    }}
                >
                    CHAT
                </Typography>
                <br />
                <Grid
                    item
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "70vw",
                        height: "80vh",
                        padding: "1rem",
                        mb: 2,
                        borderRadius: "1rem",
                        boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.2)",
                        // make background different for light and dark mode
                        backgroundColor:
                            currThemeRef.current === "light"
                                ? "#F5F5F5"
                                : "#222222",
                        "@media (max-width: 900px)": {
                            width: "90vw",
                        },
                    }}
                    // xs={10}
                    // md={8}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxHeight: "50%",
                        }}
                    >
                        {messages.length > 0 ? (
                            <List
                                sx={{
                                    height: "180%",
                                    overflowY: "auto",
                                    flex: 1,
                                    "@media (max-width: 600px)": {
                                        height: "170%",
                                    },
                                    "@media (max-height: 900px)": {
                                        height: "175%",
                                    },
                                    "&::-webkit-scrollbar": {
                                        borderRadius: "0.5rem",
                                        width: "0.2em",
                                        backgroundColor:
                                            currThemeRef.current === "light"
                                                ? "#F5F5F5"
                                                : "#222222",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        borderRadius: "0.5rem",
                                        backgroundColor:
                                            currThemeRef.current === "light"
                                                ? "#000000"
                                                : "#ffffff",
                                    },
                                    scrollBehavior: "smooth",
                                }}
                                ref={(el) => {
                                    if (el) {
                                        el.scrollTop = el.scrollHeight;
                                    }
                                }}
                            >
                                {messages.map((message) => (
                                    <ListItem
                                        key={message.text}
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            background:
                                                currThemeRef.current === "light"
                                                    ? message.sender ===
                                                      "JokeBot"
                                                        ? "linear-gradient(45deg, #B2EBF2 30%, #FFD54F 90%)" // light mode
                                                        : "" // light mode
                                                    : currTheme === "dark"
                                                    ? message.sender ===
                                                      "JokeBot"
                                                        ? "linear-gradient(45deg, #2E2E2E 30%, #4F4F4F 90%)" // dark mode
                                                        : "" // dark mode
                                                    : "",

                                            borderRadius: "0.5rem",
                                            padding: "0.5rem",
                                            margin: "0.5rem",
                                            "@media (max-width: 1240px)": {
                                                margin: "0.2rem",
                                                maxWidth: "96%",
                                            },
                                            maxWidth: "98%",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="secondary"
                                            sx={{
                                                display: "block",
                                                mr: "0.7rem",
                                                fontWeight: "bold",
                                                "@media (max-width: 899px)": {
                                                    // fontSize: "0.6rem",
                                                    display: "none",
                                                },
                                            }}
                                        >
                                            {message.sender}:
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                display: "inline",
                                                width: "auto",
                                                color:
                                                    message.text ===
                                                    "Sorry, I am unable to connect to the server. Please try again later."
                                                        ? "#FF0000"
                                                        : "",
                                                "@media (max-width: 899px)": {
                                                    fontSize: "0.7rem",
                                                    display: "block",
                                                },
                                            }}
                                        >
                                            {message.text
                                                .split("\n")
                                                .map((line, index) => (
                                                    <React.Fragment key={index}>
                                                        {line}
                                                        <br />
                                                    </React.Fragment>
                                                ))}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography
                                variant="body1"
                                align="center"
                                sx={{
                                    "@media (max-width: 600px)": {
                                        fontSize: "0.7rem",
                                    },
                                }}
                            >
                                No messages yet!
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            mt: "auto",

                            "@media (max-width: 600px)": {
                                flexDirection: "column",
                            },
                        }}
                    >
                        <TextField
                            autoFocus
                            margin="normal"
                            label="Enter your message"
                            id="message"
                            sx={{ width: "88%" }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            sx={{ width: "8%", p: "0.5rem", m: "0.5rem" }}
                        >
                            SEND
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default Chat;
