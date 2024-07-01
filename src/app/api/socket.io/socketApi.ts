import { Server } from "socket.io";
import { NextResponse } from "next/server";

let io: Server;

export async function socketHandler(request: Request) {
  console.log("SOCKET API!!!");
  if (!io) {
    console.log("Socket is initializing");
    io = new Server({
      // disable in prod
      // cors: {
      //   origin: "http://localhost:3000"
      // },
    });
    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });

      socket.on("message", (msg) => {
        console.log("Message received:", msg);
        socket.broadcast.emit("message", msg);
      });
    });
  } else {
    console.log("Socket is already running");
  }

  return NextResponse.json({ message: "Socket initialized" });
}
