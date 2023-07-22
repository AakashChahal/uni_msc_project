import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./Chat";
import TweetPictureGenerate from "./TweetPictureGenerate";
import HumourousReply from "./HumourousReply";
import VoiceChat from "./VoiceChat";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Chat />} />
                <Route
                    path="/tweet-picture-generate"
                    element={<TweetPictureGenerate />}
                />
                <Route path="/humourous-reply" element={<HumourousReply />} />
                <Route path="/voice-chat" element={<VoiceChat />} />
            </Routes>
        </Router>
    );
}

export default App;
