import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import http from 'http';

import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donor.js';
import requestRoutes from './routes/request.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import donationHistoryRoutes
from "./routes/donationHistoryRoutes.js";
import analyticsRoutes
from "./routes/analyticsRoutes.js";
import notificationRoutes
from "./models/routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();


// ======================================================
// HTTP SERVER + SOCKET SERVER
// ======================================================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://lifeflow-frontend-ivory.vercel.app"
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE"
    ],
    credentials: true
  }
});


// ======================================================
// ONLINE USERS STORE
// ======================================================

const onlineUsers = {};


// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on("connection", (socket) => {

  console.log(
    "⚡ User Connected:",
    socket.id
  );

  // ======================================================
  // REGISTER USER
  // ======================================================

  socket.on(
  "registerUser",
  (userId) => {

    console.log(
      "REGISTER USER EVENT RECEIVED:",
      userId
    );

    onlineUsers[userId] =
      socket.id;

    console.log(
      "ONLINE USERS:",
      onlineUsers
    );

  }
);


  // ======================================================
  // DISCONNECT
  // ======================================================

  socket.on("disconnect", () => {

    for (const userId in onlineUsers) {

      if (
        onlineUsers[userId] === socket.id
      ) {

        delete onlineUsers[userId];

        break;

      }

    }

    console.log(
      "❌ User Disconnected:",
      socket.id
    );

  });

});
app.set("io", io);
app.set("onlineUsers", onlineUsers);


// ======================================================
// MAKE ONLINE USERS GLOBAL
// ======================================================

app.set(
  "onlineUsers",
  onlineUsers
);


// ======================================================
// GLOBAL MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lifeflow-frontend-ivory.vercel.app"
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    credentials: true
  })
);

app.use(
  express.json({
    limit: '10mb'
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

app.use(
  "/api/inventory",
  inventoryRoutes
);

app.use(
  "/api/donations",
  donationHistoryRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// ======================================================
// SOCKET MIDDLEWARE
// ======================================================

app.use((req, res, next) => {

  req.io = io;

  next();

});


// ======================================================
// DEBUG LOGGER
// ======================================================

app.use((req, res, next) => {

  console.log(
    `[${new Date().toLocaleTimeString()}] 🛰️ ${req.method} -> ${req.url}`
  );

  next();

});



// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);

app.use('/api/donors', donorRoutes);

app.use('/api/requests', requestRoutes);

app.use('/api/leaderboard', leaderboardRoutes);

app.use('/api/users', userRoutes);

app.use("/api/hospital", hospitalRoutes);

app.use("/api/admin", adminRoutes);


// ======================================================
// ROOT ROUTE
// ======================================================

app.get('/', (req, res) => {

  res.status(200).json({

    status: 'online',

    message:
      'LifeFlow Unified Backend API running successfully'

  });

});


// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      `Requested route [${req.method} ${req.url}] not found.`

  });

});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({

    success: false,

    message:
      'Internal Server Error'

  });

});


// ======================================================
// DATABASE CONNECTION
// ======================================================

const PORT =
  process.env.PORT || 5001;

const MONGO_URI =
  process.env.MONGO_URI;


mongoose
  .connect(MONGO_URI)

  .then(() => {

    console.log(
      '✅ MongoDB Connected Successfully'
    );

    server.listen(PORT, () => {

      console.log(
        `🚀 Server running on PORT ${PORT}`
      );

      console.log(
        `⚡ Socket.IO Active`
      );

    });

  })

  .catch((err) => {

    console.error(
      '❌ MongoDB Error:',
      err
    );

  });



  