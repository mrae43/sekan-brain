import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './lib/db';
import { Sentence } from './models/sentences';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Refinery Server running' });
});

app.post('/ingest', async (req, res) => {
  try {
    const { content, noteId, contextId, subject, sequence } = req.body;
    
    if (!content || !noteId || !sequence) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sentenceData = {
      content,
      noteId: new mongoose.Types.ObjectId(noteId),
      contextId: contextId ? new mongoose.Types.ObjectId(contextId) : undefined,
      subject,
      sequence: Number(sequence),
      stage: 'garbage',
    };
    
    const garbage = await Sentence.create(sentenceData);
    res.status(201).json(garbage);
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Failed to ingest sentence' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Refinery Server on http://localhost:${PORT}`);
  });
}).catch(console.error);
