"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const app_1 = require("./app");
// Load environment variables
(0, dotenv_1.config)();
const PORT = Number(process.env.PORT || 4000);
const app = (0, app_1.createApp)();
// Start server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Database connected to: ${process.env.DATABASE_URL?.split('@')[1]}`);
});
