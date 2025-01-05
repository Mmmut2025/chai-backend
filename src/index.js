import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({ path: './.env' });


// Connect to the database
console.log("===================================================");
connectDB()
.then(() => {
    // Start the server after successful DB connection
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
})
.catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit the process if the DB connection fails
});
