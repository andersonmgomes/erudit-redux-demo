import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import MessageList from './features/message/MessageList';

interface Item {
    PK: string;
    order: number;
    author: string;
    message: string;
}

function App() {
    const [selectedMessage, setSelectedMessage] = useState<Item | null>(null);

    const handleItemClick = (item: Item) => {
        setSelectedMessage(item);
    };

    return (
        <div className="app-container d-flex h-100">
            <div className="message-list-wrapper">
                <MessageList onItemClick={handleItemClick} />
            </div>
            <div className="main-panel-wrapper flex-grow-1">
                {selectedMessage ? (
                    <div>
                        <h3>Message Details</h3>
                        <p>
                            <strong>Author:</strong> {selectedMessage.author}
                        </p>
                        <p>
                            <strong>Message:</strong> {selectedMessage.message}
                        </p>
                    </div>
                ) : (
                    <h2>Main Panel</h2>
                )}
            </div>
        </div>
    );
}

export default App;
