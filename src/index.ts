import express, { Request, Response } from 'express';
import fs from 'fs';

const app = express();
const port = 3000;

interface NameData {
    name: string;
    exclusionDate?: string;
}

// Read names from the text file
const namesData: NameData[] = fs.readFileSync(`${__dirname}/../dist/names.txt`, 'utf-8')
    .split('\n')
    .map((line) => {
        const [name, exclusionDate] = line.split(':');
        return { name, exclusionDate };
    });

// Store the selected name for the day and last stored date
let selectedNameForDay: string | null = null;
let lastStoredDate: string | null = null;

// Endpoint to get a single name daily
app.get('/getDailyName', (req: Request, res: Response) => {
    const today: string = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

    // Check if the current date is different from the last stored date
    if (lastStoredDate !== today) {
        selectedNameForDay = null; // Reset selectedNameForDay
        lastStoredDate = today; // Update last stored date
    }

    // Check if a name is already selected for the day
    if (selectedNameForDay !== null) {
        res.json({ name: selectedNameForDay });
        return;
    }

    let randomNameData: NameData | undefined;
    do {
        // Randomly select a name
        randomNameData = namesData[Math.floor(Math.random() * namesData.length)];

        if (!randomNameData.exclusionDate || randomNameData.exclusionDate !== today) {
            // Check if the name was already selected for the day
            if (!selectedNameForDay || selectedNameForDay !== randomNameData.name) {
                // Set the selected name for the day
                selectedNameForDay = randomNameData.name;
                break;
            }
        }
    } while (true);

    res.json({ name: selectedNameForDay });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});