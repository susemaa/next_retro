import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { get, getStore, set } from "./store";
import type { CreateRetroCallback, GetRetroCallback, ChangeRetroStateCallback, RetroStages, Idea, Ideas, InitPositionsCallback, Groups, InitGroupsCallback, User } from "@/contexts/RetroContext";
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
      const newRetro: Retro = {
        createdAt: Date.now(),
        createdBy: email,
        stage: "lobby" as const,
        ideas: {
          "happy": [],
          "sad": [],
          "confused": [],
        },
        groups: {},
        everJoined: [],
        actionItems: [],
      };
      set(generatedUuid, newRetro);
      console.log("setted socket", getStore());
      callback({ status: 200, id: generatedUuid, retro: newRetro });
      // callback({ status: 400 }); // if not saved
    });

    socket.on("getRetro", (retroId: string, callback: GetRetroCallback) => {
      const retro = get(retroId);
      if (retro) {
        callback({ status: 200, retro });
      } else {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("changeRetroStage", (retroId: string, stage: RetroStages, callback: ChangeRetroStateCallback) => {
      const retro = get(retroId);
      if (retro) {
        retro.stage = stage;
        if (stage === "finished") {
          // fetch(new URL("/api/mailer", "http://localhost:3000"), {
          //   method: "POST",
          //   body: {
          //     to: retro.everJoined.map(user => user.email),
          //     subject: "Action items from Retro",
          //     text: retro.actionItems.map(item => `${item.name} (${item.assignedUser.name})`).join("\n"),
          //   },
          // });
        }
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
        // socket.emit("retroUpdated", retro, retroId);
        // socket.broadcast.emit("retroUpdated", retro, retroId);
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

    socket.on("initGroups", (retroId: string, groups: Groups, cb: InitGroupsCallback) => {
      const retro = get(retroId);
      if (retro) {
        retro.groups = groups;
        cb({ status: 200 });
        set(retroId, retro);
        // socket.emit("retroUpdated", retro, retroId);
        // socket.broadcast.emit("retroUpdated", retro, retroId);
      } else {
        cb({ status: 404, error: `Retro with ${retroId} not found`});
      }
    });

    socket.on("updateGroupName", (retroId: string, groupId:string, newName: string) => {
      const retro = get(retroId);
      if (retro) {
        const group = retro.groups[groupId];
        if (group) {
          group.name = newName;
          retro.groups = { ...retro.groups, [groupId]: group };
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("voteAdd", (retroId: string, groupId: string, email: string) => {
      const retro = get(retroId);
      if (retro) {
        const user = retro.everJoined.find(user => user.email === email);
        if (user && user.votes > 0) {
          user.votes -= 1;
          retro.groups[groupId].votes.push(email);
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("voteSubstract", (retroId: string, groupId: string, email: string) => {
      const retro = get(retroId);
      if (retro) {
        const user = retro.everJoined.find(user => user.email === email);
        const groupVotes = retro.groups[groupId].votes;
        const emailIndex = groupVotes.indexOf(email);
        if (user && emailIndex !== -1) {
          user.votes += 1;
          groupVotes.splice(emailIndex, 1);
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("sendActionItem", (retroId: string, author: User, assignee: User, item: string) => {
      const retro = get(retroId);
      if (retro) {
        retro.actionItems.push({ id: uuidv4(), assignedUser: assignee, name: item, author });
        set(retroId, retro);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("removeActionItem", (retroId: string, actionItemId: string) => {
      const retro = get(retroId);
      if (retro) {
        const actionItemIndex = retro.actionItems.findIndex(item => item.id === actionItemId);
        if (actionItemIndex !== -1) {
          retro.actionItems.splice(actionItemIndex, 1);
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("updateActionItem", (retroId: string, actionItemId: string, newAssignee: User, newName: string) => {
      const retro = get(retroId);
      if (retro) {
        const actionItem = retro.actionItems.find(item => item.id === actionItemId);
        if (actionItem) {
          actionItem.assignedUser = newAssignee;
          actionItem.name = newName;
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("upd", () => {
      socket.emit("storage", getStore());
    });

    socket.on("user", (retroId: string, userData?: UserData) => {
      const retro = get(retroId);
      if (
        userData &&
        userData.email &&
        userData.name &&
        retro
      ) {
        if (!retro.everJoined.find(user => user.email === userData.email)) {
          retro.everJoined.push({ email: userData.email, votes: 3, name: userData.name });
          set(retroId, retro);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }

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
