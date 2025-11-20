import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.exercisedb.dev/api/v1';
const DATA_DIR = path.join(__dirname, 'app', 'data');

async function fetchAllExercises(filename) {
    let url = `${BASE_URL}/exercises?limit=100`; // Start with a safe limit
    let allExercises = [];
    let page = 1;

    console.log(`Fetching all exercises...`);

    try {
        while (url) {
            console.log(`Fetching page ${page} (${url})...`);
            const response = await fetch(url);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }
            const json = await response.json();
            
            if (json.data) {
                allExercises = allExercises.concat(json.data);
            }

            if (json.metadata && json.metadata.nextPage) {
                url = json.metadata.nextPage;
            } else {
                url = null;
            }
            
            page++;
            // Add a small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error fetching exercises:', error);
        console.log('Saving partial data...');
    }

    if (allExercises.length > 0) {
        const filePath = path.join(DATA_DIR, filename);
        const result = {
            success: true,
            data: allExercises,
            metadata: {
                totalExercises: allExercises.length
            }
        };
        
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
        console.log(`Saved ${allExercises.length} exercises to ${filePath}`);
    }
}

async function fetchData(endpoint, filename, limit = null) {
    try {
        let url = `${BASE_URL}/${endpoint}`;
        if (limit) {
            url += `?limit=${limit}`;
        }
        console.log(`Fetching ${url}...`);
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        }
        const json = await response.json();
        
        const filePath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        console.log(`Saved to ${filePath}`);
        return json;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
    }
}

async function main() {
    if (!fs.existsSync(DATA_DIR)){
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    await fetchData('muscles', 'api_muscles.json');
    await fetchData('equipments', 'api_equipments.json');
    await fetchData('bodyparts', 'api_bodyParts.json');
    
    await fetchAllExercises('api_exercises.json');
}

main();
