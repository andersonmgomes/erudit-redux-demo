import React, { useState, useEffect } from 'react';
import { Item } from './MessageList';

interface MessageEditorProps {
    item: Item | null;
    onSave: (item: Item) => void;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ item, onSave }) => {
    const [message, setMessage] = useState(item?.message || '');

    useEffect(() => {
        setMessage(item?.message || '');
    }, [item]);

    const handleSave = () => {
        if (item) {
            onSave({ ...item, message });
        }
    };

    return (
        <div>
            {item && (
                <>
                    <h3>{item.author}</h3>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={10}
                        cols={50}
                    />
                    <br />
                    <button onClick={handleSave}>Save</button>
                </>
            )}
        </div>
    );
};

export default MessageEditor;
