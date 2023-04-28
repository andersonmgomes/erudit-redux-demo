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
    sentiment_analysis: string;
}

async function fetchItems(): Promise<Record<string, Item[]>> {
    const params = {
        TableName: 'EruditDemoStack-SingleTable787355C7-1GOOCK7AW39JN',
    };

    try {
        const command = new ScanCommand(params);
        const data = await dynamoDb.send(command);
        const items = data.Items?.map((item) => unmarshall(item)) as Item[];
        const groupedItems = items.reduce((acc, item) => {
            if (!acc[item.PK]) {
                acc[item.PK] = [];
            }
            acc[item.PK].push(item);
            return acc;
        }, {} as Record<string, Item[]>);
        console.log('Fetched items:', groupedItems);
        return groupedItems;
    } catch (error) {
        console.error('Error fetching items:', error);
        return {};
    }
}

interface MessageListProps {
    onItemClick: (item: Item) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onItemClick }) => {
    const [groupedItems, setGroupedItems] = useState<Record<string, Item[]>>({});

    useEffect(() => {
        async function fetchData() {
            console.log('Fetching items...');
            const fetchedItems = await fetchItems();
            console.log('Items fetched:', fetchedItems);
            setGroupedItems(fetchedItems);
        }

        fetchData();
    }, []);

    console.log('Rendering items:', groupedItems);

    return (
        <ul className="list-group">
            {Object.entries(groupedItems).map(([pk, items]) => (
                <React.Fragment key={pk}>
                    <li className="list-group-item list-group-item-primary">{pk}</li>
                    {items.map((item) => (
                        <li
                            key={`${pk}-${item.order}`}
                            className="list-group-item"
                            onClick={() => onItemClick(item)}
                        >
                            {item.author}: {item.message}
                        </li>
                    ))}
                </React.Fragment>
            ))}
        </ul>
    );
};

export default MessageList;
