import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import MessageList from './features/message/MessageList';

function App() {
    return (
        <div className="app-container d-flex h-100">
            <div className="message-list-wrapper">
                <MessageList />
            </div>
            <div className="main-panel-wrapper flex-grow-1">
                <h2>Main Panel</h2>
            </div>
        </div>
    );
}

export default App;
