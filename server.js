import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import {
  addEverjoined,
  addGroups,
  addIdea,
  addUser,
  deleteIdea,
  getFullRetro,
  getFullStore,
  getRetro,
  getUser,
  updateGroup,
  updateIdea,
  updateRetro,
  addActionItem,
  updateActionItem,
  deleteActionItem,
} from "./src/app/api/storage/storage.js";

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

    socket.on("changeRetroStage", async (retroId, stage, callback) => {
      try {
        const retro = await getFullRetro(retroId);
        if (!retro) {
          throw new Error();
        }
        retro.stage = stage;
        await updateRetro(retroId, {
          uId: retro.uId,
          retroType: retro.retroType,
          stage: retro.stage,
          votesAmount: retro.votesAmount,
          name: retro.name || "",
          summaryMsg: retro.summaryMsg || "",
          createdAt: retro.createdAt,
          createdBy: retro.createdBy,
          everJoined: retro.everJoined,
        });
        callback({ status: 200, retro });
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      } catch {
        callback({ status: 404, error: "Retro not found" });
      }
    });

    socket.on("updateRetroInfo", async (retroId, newName, newDescription) => {
      const retro = await getFullRetro(retroId);
      if (retro && (typeof newName === "string" || typeof newDescription === "string")) {
        if (typeof newName === "string") {
          retro.name = newName;
        }
        if (typeof newDescription === "string") {
          retro.summaryMsg = newDescription;
        }
        await updateRetro(retroId, {
          uId: retro.uId,
          retroType: retro.retroType,
          stage: retro.stage,
          votesAmount: retro.votesAmount,
          name: retro.name || "",
          summaryMsg: retro.summaryMsg || "",
          createdAt: retro.createdAt,
          createdBy: retro.createdBy,
          everJoined: retro.everJoined,
        });
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("idea", async (retroId, type, message) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const idea = await addIdea(retroId, message, type);
        retro.ideas.push(idea);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("removeIdea", async (retroId, ideaId) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const ideaIndex = retro.ideas.findIndex(idea => idea.id === ideaId);
        if (ideaIndex !== -1) {
          retro.ideas.splice(ideaIndex, 1);
          await deleteIdea(ideaId);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("updateIdea", async (retroId, ideaId, newType, newIdea) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const ideaIndex = retro.ideas.findIndex(idea => idea.id === ideaId);
        if (ideaIndex !== -1) {
          const idea = retro.ideas[ideaIndex];
          idea.idea = newIdea;
          idea.type = newType;
          await updateIdea(idea.id, idea);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("initPositions", async (retroId, ideas, cb) => {
      const retro = await getRetro(retroId);
      if (retro) {
        await Promise.all(ideas.map(async (idea) => await updateIdea(idea.id, idea)));
        cb({ status: 200 });
        // socket.emit("retroUpdated", retro, retroId);
        // socket.broadcast.emit("retroUpdated", retro, retroId);
      } else {
        cb({ status: 404, error: `Retro with ${retroId} not found`});
      }
    });

    socket.on("updatePosition", async (retroId, ideaId, newPosition) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        // retro.ideas.some(async (idea) => {
        retro.ideas.forEach(async (idea) => {
          if (idea.id === ideaId) {
            idea.x = newPosition.x;
            idea.y = newPosition.y;
            await updateIdea(idea.id, idea);
            socket.emit("retroUpdated", retro, retroId);
            socket.broadcast.emit("retroUpdated", retro, retroId);
            // return true;
          }
          // return false;
        });
      }
    });

    socket.on("initGroups", async (retroId, groups, cb) => {
      const retro = await getRetro(retroId);
      if (retro) {
        // Object.values(groups).map(async (ideaIds) => await addGroup(retroId, ideaIds));
        await addGroups(retroId, Object.values(groups));
        cb({ status: 200 });
      } else {
        cb({ status: 404, error: `Retro with ${retroId} not found`});
      }
    });

    socket.on("updateGroupName", async (retroId, groupId, newName) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const group = retro.groups.find(group => group.id === groupId);
        if (group) {
          group.name = newName;
          await updateGroup(groupId, group);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("voteAdd", async (retroId, groupId, email) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const group = retro.groups.find(group => group.id === groupId);
        const userEmail = retro.everJoined.find(iterEmail => iterEmail === email);
        const userVotes = retro.groups.flatMap(group => group.votes).filter(iterEmail => iterEmail === email).length;
        if (group && userEmail && userVotes < retro.votesAmount) {
          group.votes.push(userEmail);
          await updateGroup(groupId, group);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("voteSubstract", async (retroId, groupId, email) => {
      const retro = await getFullRetro(retroId);
      const group = retro?.groups.find(group => group.id === groupId);
      if (retro && group) {
        const userEmail = retro.everJoined.find(iterEmail => iterEmail === email) || "";
        const userVoteIdx = group.votes.indexOf(userEmail);
        if (userVoteIdx !== -1) {
          group.votes.splice(userVoteIdx, 1);
          await updateGroup(groupId, group);
          socket.emit("retroUpdated", retro, retroId);
          socket.broadcast.emit("retroUpdated", retro, retroId);
        }
      }
    });

    socket.on("sendActionItem", async (retroId, author, assignee, item) => {
      const retro = await getFullRetro(retroId);
      if (retro) {
        const actionItem = await addActionItem(retroId, item, author.email, assignee.email);
        retro.actionItems.push(actionItem);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("removeActionItem", async (retroId, actionItemId) => {
      const retro = await getFullRetro(retroId);
      const actionItemIndex = retro?.actionItems.findIndex(item => item.id === actionItemId);
      if (retro && actionItemIndex && actionItemIndex !== -1) {
        await deleteActionItem(actionItemId);
        retro.actionItems.splice(actionItemIndex, 1);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("updateActionItem", async (retroId, actionItemId, newAssignee, newName) => {
      const retro = await getFullRetro(retroId);
      const actionItem = retro?.actionItems.find(item => item.id === actionItemId);
      if (retro && actionItem) {
        actionItem.assignedEmail = typeof newAssignee === "string" ? newAssignee : newAssignee.email;
        actionItem.name = newName;
        await updateActionItem(actionItemId, actionItem);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("updateActionAuthor", async (retroId, actionItemId, newAuthor) => {
      const retro = await getFullRetro(retroId);
      const actionItem = retro?.actionItems.find(item => item.id === actionItemId);
      if (retro && actionItem) {
        actionItem.authorEmail = typeof newAuthor === "string" ? newAuthor : newAuthor.email;
        await updateActionItem(actionItemId, actionItem);
        socket.emit("retroUpdated", retro, retroId);
        socket.broadcast.emit("retroUpdated", retro, retroId);
      }
    });

    socket.on("upd", async (email) => {
      const store = await getFullStore(email);
      socket.emit("storage", store);
    });

    socket.on("user", async (retroId, userData) => {
      const retro = await getFullRetro(retroId);
      if (
        userData &&
        userData.email &&
        userData.name &&
        userData.image &&
        retro
      ) {
        const { email, name, image } = userData;
        const user = await getUser(userData.email);
        if (!user) {
          await addUser(email, name, image);
        }

        if (!retro.everJoined.includes(email)) {
          await addEverjoined(retroId, email);
          retro.everJoined.push(email);
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

        // Check if the email is already associated with another retroId
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
        socket.broadcast.emit("users", retroId, users[retroId]);
      }
    });

    socket.on("disconnect", () => {
      for (const retroId in users) {
        if (users[retroId][socket.id]) {
          delete users[retroId][socket.id];
          socket.broadcast.emit("users", retroId, users[retroId]);
          break;
        }
      }
    });
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
