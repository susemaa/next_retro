import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { get, getStore, set } from "./store";
import type { CreateRetroCallback, GetRetroCallback, ChangeRetroStateCallback, RetroTypes, Idea, Ideas, InitPositionsCallback } from "@/contexts/RetroContext";
import type { Socket } from "socket.io";
import type { Retro, UserData } from "@/contexts/RetroContext";
import { IdeaType } from "@/contexts/RetroContext";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const users: Record<string, Record<string, UserData>> = {};

  const io = new Server(httpServer);

  io.on("connection", (socket: Socket) => {
    socket.on("createRetro", (email: string, callback: CreateRetroCallback) => {
      const generatedUuid = uuidv4();
      const newRetro = {
        createdAt: Date.now(),
        createdBy: email,
        stage: "lobby" as const,
        ideas: {
          "happy": [],
          "sad": [],
          "confused": [],
        },
      };
      // TODO save to storage
      set(generatedUuid, newRetro);
      console.log("setted socket", getStore());
      callback({ status: 200, id: generatedUuid, retro: newRetro });
      // callback({ status: 400 }); // if not saved
    });

    socket.on("getRetro", (retroId: string, callback: GetRetroCallback) => {
      // TODO replace with storage fetch
      const retro = get(retroId);
      if (retro) {
        callback({ status: 200, retro });
      } else {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("changeRetroState", (retroId: string, stage: RetroTypes, callback: ChangeRetroStateCallback) => {
    // const retro = retros.get(retroId);
      const retro = get(retroId);
      if (retro) {
        retro.stage = stage;
        // retros.set(retroId, retro);
        set(retroId, retro);
        callback({ status: 200, retro });
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      } else {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("idea", (retroId: string, type: IdeaType, message: string) => {
      const retro = get(retroId);
      if (retro && retro.ideas[type]) {
        retro.ideas[type].push({
          idea: message,
          id: uuidv4(),
          position: { x: 0, y: 0, z: 0 },
        });
        set(retroId, retro);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("removeIdea", (retroId: string, ideaId: string, type: IdeaType) => {
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

    socket.on("updateIdea", (retroId: string, ideaId: string, newType: IdeaType, newIdea: string) => {
      const retro = get(retroId);
      if (retro && retro.ideas[newType]) {
        Object.keys(retro.ideas).some((type) => {
          const ideaIndex = retro.ideas[type as IdeaType].findIndex(idea => idea.id === ideaId);
          if (ideaIndex !== -1) {
            if (type === newType) {
              retro.ideas[type][ideaIndex].idea = newIdea;
            } else {
              const [idea] = retro.ideas[type as IdeaType].splice(ideaIndex, 1);
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

    socket.on("initPositions", (retroId: string, ideas: Ideas, cb: InitPositionsCallback) => {
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

    socket.on("updatePosition", (retroId: string, ideaId: string, newPosition: { x: number; y: number }) => {
      const retro = get(retroId);
      if (retro) {
        Object.keys(retro.ideas).some((type) => {
          const ideaIndex = retro.ideas[type as IdeaType].findIndex(idea => idea.id === ideaId);
          if (ideaIndex !== -1) {
            retro.ideas[type as IdeaType][ideaIndex].position = {
              ...retro.ideas[type as IdeaType][ideaIndex].position,
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

    socket.on("user", (retroId: string, userData?: UserData) => {
      if (userData) {
        // Check if the socket id is already associated with another retroId
        for (const existingRetroId in users) {
          if (users[existingRetroId] && users[existingRetroId][socket.id]) {
            delete users[existingRetroId][socket.id];
            socket.emit("users", existingRetroId, users[existingRetroId]);
            break;
          }
        }

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

  io.on("disconnect", (socket: Socket) => {
    for (const retroId in users) {
      if (users[retroId][socket.id]) {
        delete users[retroId][socket.id];
        socket.broadcast.emit("users", retroId, users[retroId]);
        break;
      }
    }
    console.log("SERVER: disconnected");
  });

  httpServer
    .once("error", (err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
