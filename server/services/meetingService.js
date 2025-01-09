import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class MeetingService {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'data', 'meetings.json');
    this.ensureDataFileExists();
  }

  ensureDataFileExists() {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.dataFile)) {
        fs.writeFileSync(this.dataFile, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error ensuring data file exists:', error);
      throw new Error('Failed to initialize meeting service');
    }
  }

  async getMeetings() {
    try {
      await fs.promises.access(this.dataFile, fs.constants.R_OK | fs.constants.W_OK);
      const data = await fs.promises.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading meetings:', error);
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it and return empty array
        await fs.promises.writeFile(this.dataFile, JSON.stringify([]));
        return [];
      }
      throw new Error('Failed to read meetings data');
    }
  }

  async createMeeting(meetingData) {
    try {
      const meetings = await this.getMeetings();
      const newMeeting = {
        id: uuidv4(),
        ...meetingData,
        createdAt: new Date().toISOString(),
      };
      
      meetings.push(newMeeting);
      await fs.promises.writeFile(this.dataFile, JSON.stringify(meetings, null, 2));
      
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  async deleteMeeting(meetingId, username) {
    try {
      const meetings = await this.getMeetings();
      const meetingIndex = meetings.findIndex(m => m.id === meetingId);
      
      if (meetingIndex === -1) {
        throw new Error('Meeting not found');
      }
      
      if (meetings[meetingIndex].createdBy !== username) {
        throw new Error('Unauthorized to delete this meeting');
      }
      
      meetings.splice(meetingIndex, 1);
      await fs.promises.writeFile(this.dataFile, JSON.stringify(meetings, null, 2));
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }
}