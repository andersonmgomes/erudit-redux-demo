import React, { useState, useEffect } from 'react';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDb = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_ID!,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY!,
    },
});


interface Item {
    PK: string;
    order: number;
    author: string;
    message: string;
}

async function fetchItems(): Promise<Item[]> {
    const params = {
        TableName: 'EruditDemoStack-SingleTable787355C7-1GOOCK7AW39JN',
    };

    try {
        const command = new ScanCommand(params);
        const data = await dynamoDb.send(command);
        const items = data.Items?.map((item) => unmarshall(item)) as Item[];
        console.log('Fetched items:', items);
        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
}

const MessageList: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        async function fetchData() {
            console.log('Fetching items...');
            const fetchedItems = await fetchItems();
            console.log('Items fetched:', fetchedItems);
            setItems(fetchedItems);
        }

        fetchData();
    }, []);

    console.log('Rendering items:', items);

    return (
        <ul className="list-group">
            {items.map((item) => (
                <li key={item.PK} className="list-group-item">
                    {item.author}: {item.message}
                </li>
            ))}
        </ul>
    );
};

export default MessageList;
