// this page in the webapp uses same theme as the other pages and contains a form for the user to enter any text they want to be replied to with a funny response
// the form is submitted to the backend and the response is displayed on the page
// the page also contains a button to return to the home page
// the page is rendered in the App.js file
// the page is uses the same styling as the other pages in the webapp and is responsive using @mui/material

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/system";
import "./App.css";

const MyButton = styled(Button)({
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 10,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
});

const HumourousReply = () => {
    const [reply, setReply] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        fetch("http://localhost:5000/humourous-reply", {
            reply,
        }).then((res) => {
            console.log(res);
            console.log(res.data);
            document.getElementById("humourous-reply").innerHTML = res.data;
        });
    };

    return (
        <div className="App">
            <header className="App-header">
                <Typography variant="h1" component="div" gutterBottom>
                    Humourous Reply
                </Typography>
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { m: 1, width: "25ch" },
                    }}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <TextField
                            id="outlined-multiline-static"
                            label="Enter text to be replied to"
                            multiline
                            rows={4}
                            defaultValue="Enter text here"
                            onChange={(e) => setReply(e.target.value)}
                        />
                    </div>
                    <div>
                        <MyButton type="submit">Submit</MyButton>
                    </div>
                </Box>
                <div id="humourous-reply"></div>
                <div>
                    <Link to="/">
                        <MyButton>Return to Home Page</MyButton>
                    </Link>
                </div>
            </header>
        </div>
    );
};

export default HumourousReply;
