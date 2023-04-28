import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import MessageList, { Item, dynamoDb, fetchItems } from './features/message/MessageList';
import MessageEditor from './features/message/MessageEditor';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';


const sqs = new SQSClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_ID!,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY!,
    },
});

async function sendToSQSQueue(queueUrl: string, message: string) {
    const params = {
        QueueUrl: queueUrl,
        MessageBody: message,
    };

    console.log('Sending message to this SQS queue:', queueUrl);

    try {
        const command = new SendMessageCommand(params);
        await sqs.send(command);
        console.log('Message sent to SQS queue:', message);
    } catch (error) {
        console.error('Error sending message to SQS queue:', error);
    }
}

const classifierQueueUrl = 'https://sqs.us-east-1.amazonaws.com/436594502614/EruditDemoStack-ChatSimulatorQueueD0DF006C-gmQXGtmY4MGc';
async function sendToSQSClassifierQueue(item: Item) {
    // Convert the updated item to a JSON string
    const itemJson = JSON.stringify(item);
    // Send the updated item to the SQS queue
    await sendToSQSQueue(classifierQueueUrl, itemJson);
}

function App() {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);

    const handleItemClick = (item: Item) => {
        setSelectedItem(item);
    };

    const updateItemMessage = async (updatedItem: Item) => {
        try {
            const params = {
                TableName: 'EruditDemoStack-SingleTable787355C7-1GOOCK7AW39JN',
                Key: marshall({
                    PK: updatedItem.PK,
                    order: updatedItem.order,
                }),
                UpdateExpression: 'SET message = :message, sentiment_analysis = :sentiment_analysis',
                ExpressionAttributeValues: marshall({
                    ':message': updatedItem.message,
                    ':sentiment_analysis': '-'
                }),
            };

            const command = new UpdateItemCommand(params);
            await dynamoDb.send(command);
            console.log('Item updated successfully');
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleSave = async (item: Item) => {
        try {
            await updateItemMessage(item);
            setUpdateSuccess(true);
            // Fetch the updated items and pass them to the handleItemsUpdated function
            const updatedItems = await fetchItems();
            handleItemsUpdated(updatedItems);

            await sendToSQSClassifierQueue(item);

        } catch (error) {
            console.error('Error updating item:', error);
            setUpdateSuccess(false);
        }
    };


    const handleItemsUpdated = (updatedItems: Record<string, Item[]>) => {
        // Use this function to perform any additional tasks after items are updated.
        console.log('Items updated:', updatedItems);
    };

    useEffect(() => {
        if (updateSuccess !== null) {
            const timer = setTimeout(() => {
                setUpdateSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccess]);

    return (
        <div className="app-container d-flex h-100">
            <div className="message-list-wrapper">
                <MessageList onItemClick={handleItemClick} onItemsUpdated={handleItemsUpdated} />
            </div>
            <div className="main-panel-wrapper flex-grow-1">
                {updateSuccess === true && (
                    <div className="alert alert-success" role="alert">
                        Message updated successfully! The sentiment analysis will be updated shortly.
                    </div>
                )}
                {updateSuccess === false && (
                    <div className="alert alert-danger" role="alert">
                        Error updating message.
                    </div>
                )}
                <MessageEditor item={selectedItem} onSave={handleSave} />
            </div>
        </div>
    );
}

export default App;
