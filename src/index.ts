import { config } from 'dotenv';
import { createApp } from './app';

// Load environment variables
config();
const PORT = Number(process.env.PORT || 4000);

const app = createApp();

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Database connected to: ${process.env.DATABASE_URL?.split('@')[1]}`);
});