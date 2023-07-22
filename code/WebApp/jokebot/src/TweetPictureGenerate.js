import React, { useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CssBaseline,
    FormControlLabel,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Close, Favorite, ModeCommentOutlined } from "@mui/icons-material";
import html2canvas from "html2canvas";

const TweetPictureGenerate = () => {
    const [error, setError] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [tweetText, setTweetText] = useState("");
    const [randomText, setRandomText] = useState(false);
    const [currTheme, setCurrTheme] = useState("dark");
    const currThemeRef = React.useRef(currTheme);
    const [anchorEl, setAnchorEl] = useState(null);
    const roundedCommentIcon = renderToString(<ModeCommentOutlined />);
    const favoriteIcon = renderToString(<Favorite />);

    const theme = createTheme({
        palette: {
            mode: currTheme,
        },
    });

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

    const generateRandomText = async () => {
        setRandomText(!randomText);
        if (!randomText) {
            const randomJoke = await fetch(
                "https://aakashchahal.pythonanywhere.com/joke"
            );
            const randomJokeJSON = await randomJoke.json();
            setTweetText(randomJokeJSON.joke);
        }
    };

    const createNewHTMLElement = async () => {
        // get image from a url
        const image = await fetch(
            `https://api.dicebear.com/6.x/adventurer/png?seed=${fullName}&backgroundType=gradientLinear&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
        );
        const imageBlob = await image.blob();
        const imageURL = URL.createObjectURL(imageBlob);

        const twitterLogo = await fetch(
            "https://img.icons8.com/material-rounded/24/1da1f2/twitter.svg"
        );
        const twitterLogoBlob = await twitterLogo.blob();
        const twitterLogoURL = URL.createObjectURL(twitterLogoBlob);

        const html = `
                    <div style="display: flex; flex-direction: column; background-color: #000000; padding: 10px; border-radius: 10px; width: 500px; padding: 1rem; margin: 10px;" class="tweet">
                    <div style="display: flex;">
                        <img style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;" src="${imageURL}" alt="Profile Picture">
                        <div style="flex-grow: 1;" class="user-info">
                            <p style="font-weight: bold; color: #fff; margin: 0">${fullName}</p>
                            <p style="font-size: 0.7rem; margin: 0; color: #999" class="username">@${username}</p>
                        </div>
                        <img style="width: 30px; height: 30px;" src="${twitterLogoURL}"/>
                    </div>
                    <div style="flex-grow: 1;" class="tweet-content">
                        <p style="font-weight: 500; color: #fff; margin: 0; font-size: 16px; line-height: 1.2;" class="message">
                            ${tweetText}
                        </p>
                        </div>
                        <div style="margin-bottom: 10px; margin-top: 5px;">
                            <p style="margin: 0; font-size: 12px; color: #7a7a7a;" class="date">${new Date().toLocaleTimeString(
                                "en-US"
                            )} • ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div style="border: 0px solid black; border-top-width: 1px; border-color: #999; padding-top: 10px; display: flex; align-items: center;">
                            <i style="color: #f11; margin-right: 10px; padding: auto;" class="material-icons">${favoriteIcon}</i>
                            <span style="color: #999; margin-right: 10px; margin-bottom: auto; font-size: 1rem;">${(
                                Math.random() * 10 +
                                1
                            ).toFixed(2)} k</span>
                            <i style="color: #15f; margin-right: 10px;" class="material-icons">${roundedCommentIcon}</i>
                            <span style="color: #999; margin-right: 10px; margin-bottom: auto; font-size: 1rem;">${(
                                Math.random() * 10 +
                                1
                            ).toFixed(2)} k</span>
                        </div>
                </div>
        `;
        return html;
    };

    const handleGenerateTweetPicture = async () => {
        // check if username, fullname and tweet text are not empty
        if (!username || !fullName || !tweetText) {
            setError("Please fill in all the fields");
            return;
        }
        const tweetElement = await createNewHTMLElement();
        console.log(tweetElement);
        if (!tweetElement) {
            console.error("Could not find tweet element");
            return;
        }
        // make tweetElement a Node in DOM so that html2canvas can render it
        const tweetElementDOM = document.createElement("div");
        tweetElementDOM.innerHTML = tweetElement;
        document.body.appendChild(tweetElementDOM);
        tweetElementDOM.style.position = "absolute";
        tweetElementDOM.style.display = "hidden";
        tweetElementDOM.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        // add box shadow to tweet element
        tweetElementDOM.style.boxShadow =
            "0px 0px 10px 0px rgba(0, 0, 0, 0.75)";

        html2canvas(tweetElementDOM).then(function (canvas) {
            tweetElementDOM.style.display = "block";
            tweetElementDOM.remove();
            const tweetPicture = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = tweetPicture;
            link.download = "my-tweet.png";
            link.click();
        });
    };

    useEffect(() => {
        currThemeRef.current = window.localStorage.getItem("theme") ?? "dark";
        setCurrTheme(currThemeRef.current);
    }, []);

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
                        onClick={handleClickAvatar}
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
                                console.log("Already here!");
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
                    Create Tweet Picture
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
                    <TextField
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        margin="normal"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Text"
                        variant="outlined"
                        margin="normal"
                        value={tweetText}
                        onChange={(e) => setTweetText(e.target.value)}
                        disabled={randomText}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={randomText}
                                onChange={() => generateRandomText()}
                            />
                        }
                        label="Generate Random Joke"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateTweetPicture}
                        sx={{
                            marginTop: "2rem",
                            left: "50%",
                            transform: "translateX(-50%)",
                            position: "absolute",

                            "@media (max-width: 600px)": {
                                marginTop: "4rem",
                                fontSize: "1rem",
                            },

                            "&:hover": {
                                backgroundColor: "#1da1f2",
                            },
                        }}
                    >
                        Generate
                    </Button>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default TweetPictureGenerate;
