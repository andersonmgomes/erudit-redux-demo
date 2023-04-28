import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import MessageList, { Item } from './features/message/MessageList';
import MessageEditor from './features/message/MessageEditor';


function App() {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const handleSave = (item: Item) => {
        console.log('Saving edited item:', item);
    };

    return (
        <div className="app-container d-flex h-100">
            <div className="message-list-wrapper">
                <MessageList onItemClick={(item) => setSelectedItem(item)} />
            </div>
            <div className="main-panel-wrapper flex-grow-1">
                <MessageEditor item={selectedItem} onSave={handleSave} />
            </div>
        </div>
    );
}

export default App;
