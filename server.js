import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { get, getStore, set } from "./store.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const users = {};

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("createRetro", (email, callback) => {
      const generatedUuid = uuidv4();
      const newRetro = { createdAt: Date.now(), createdBy: email, stage: "lobby" };
      set(generatedUuid, newRetro);
      console.log("setted socket", getStore());
      callback({ status: 200, id: generatedUuid, retro: newRetro });
    });

    socket.on("getRetro", (retroId, callback) => {
      const retro = get(retroId);
      if (retro) {
        callback({ status: 200, retro });
      } else {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("changeRetroState", (retroId, stage, callback) => {
      const retro = get(retroId);
      if (retro) {
        retro.stage = stage;
        set(retroId, retro);
        callback({ status: 200, retro });
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      } else {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("idea", (retroId, type, message) => {
      const retro = get(retroId);
      if (retro) {
        if (retro.ideas[type]) {
          retro.ideas[type].push({
            idea: message,
            id: uuidv4(),
            position: { x: 0, y: 0 },
          });
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("removeIdea", (retroId, ideaId, type) => {
      const retro = get(retroId);
      if (retro && retro.ideas[type]) {
        const ideaIndex = retro.ideas[type].findIndex(idea => idea.id === ideaId);
        if (ideaIndex !== -1) {
          retro.ideas[type].splice(ideaIndex, 1);
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("updateIdea", (retroId, ideaId, newType, newIdea) => {
      const retro = get(retroId);
      if (retro && retro.ideas[newType]) {
        Object.keys(retro.ideas).some((type) => {
          const ideaIndex = retro.ideas[type].findIndex(idea => idea.id === ideaId);
          if (ideaIndex !== -1) {
            if (type === newType) {
              retro.ideas[type][ideaIndex].idea = newIdea;
            } else {
              const [idea] = retro.ideas[type].splice(ideaIndex, 1);
              idea.idea = newIdea;
              retro.ideas[newType].push(idea);
            }
            set(retroId, retro);
            socket.emit("retroUpdated", retro, retroId);
            socket.broadcast.emit("retroUpdated", retro, retroId);
            return true;
          }
          return false;
        });
      }
    });

    socket.on("initPositions", (retroId, ideas, cb) => {
      const retro = get(retroId);
      if (retro) {
        retro.ideas = ideas;
        cb({ status: 200 });
        set(retroId, retro);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      } else {
        cb({ status: 404, error: `Retro with ${retroId} not found`});
      }
    });

    socket.on("updatePosition", (retroId, ideaId, newPosition) => {
      const retro = get(retroId);
      if (retro) {
        Object.keys(retro.ideas).some((type) => {
          const ideaIndex = retro.ideas[type].findIndex(idea => idea.id === ideaId);
          if (ideaIndex !== -1) {
            retro.ideas[type][ideaIndex].position = {
              ...retro.ideas[type][ideaIndex].position,
              ...newPosition,
            };
            set(retroId, retro);
            socket.emit("retroUpdated", retro, retroId);
            socket.broadcast.emit("retroUpdated", retro, retroId);
            return true;
          }
          return false;
        });
      }
    });

    socket.on("upd", () => {
      socket.emit("storage", getStore());
    });

    socket.on("user", (retroId, userData) => {
      console.log("server: ON USER", retroId, userData);
      if (userData) {
        // Check if the socket id is already associated with another retroId
        for (const existingRetroId in users) {
          if (users[existingRetroId] && users[existingRetroId][socket.id]) {
            delete users[existingRetroId][socket.id];
            socket.emit("users", existingRetroId, users[existingRetroId]);
            break;
          }
        }

        // Check if the same email has different socket ids and remove the old ones
        for (const existingRetroId in users) {
          for (const existingSocketId in users[existingRetroId]) {
            if (users[existingRetroId][existingSocketId].email === userData.email) {
              delete users[existingRetroId][existingSocketId];
              socket.emit("users", existingRetroId, users[existingRetroId]);
              break;
            }
          }
        }

        // Add the user to the new retroId
        if (!users[retroId]) {
          users[retroId] = {};
        }
        users[retroId][socket.id] = userData;
        socket.emit("users", retroId, users[retroId]);
      }
    });

    socket.emit("storage", getStore());
    console.log("SERVER: connected");
  });

  io.on("disconnect", (socket) => {
    console.log("SERVER: disconnected");
    for (const retroId in users) {
      if (users[retroId] && users[retroId][socket.id]) {
        delete users[retroId][socket.id];
        socket.broadcast.emit("users", retroId, users[retroId]);
        break;
      }
    }
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
