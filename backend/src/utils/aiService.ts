import ai from './gemini';
import dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config();

export const isMocked = process.env.MOCK_AI === 'true';
export const SEARCH_THRESHOLD = isMocked ? 0.1 : 0.55;

export const generateEmbedding = async (text: string): Promise<number[]> => {
    if (isMocked) {
        const vec = new Array(768).fill(0);
        let words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

        const synonyms: Record<string, string> = {
            'legs': 'leg', 'quads': 'leg', 'squat': 'leg', 'squats': 'leg', 'calves': 'leg',
            'push': 'chest', 'bench': 'chest', 'pressing': 'chest', 'pecs': 'chest',
            'pull': 'back', 'row': 'back', 'rows': 'back', 'lats': 'back', 'pullups': 'back',
            'arms': 'arm', 'bicep': 'arm', 'biceps': 'arm', 'tricep': 'arm', 'triceps': 'arm',
            'cardio': 'run', 'running': 'run', 'treadmill': 'run',
            'pr': 'max', 'heavy': 'max', 'record': 'max'
        };

        const processedWords = words.map(w => synonyms[w] || w);
        words = [...words, ...processedWords];

        for (const word of words) {
            if (!word) continue;
            const hashHex = crypto.createHash('sha256').update(word).digest('hex');
            const hashInt = parseInt(hashHex.substring(0, 8), 16);
            vec[hashInt % 768] = 1;
        }
        return vec;
    }

    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text,
        });

        return response.embeddings?.[0]?.values || [];
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
