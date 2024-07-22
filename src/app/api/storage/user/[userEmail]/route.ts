import { NextResponse } from "next/server";
import { addUser, getUser } from "../../storage";

export async function POST(req: Request, { params }: { params: { userEmail: string }}) {
  const user = await getUser(params.userEmail);
  if (user) {
    return NextResponse.json({ status: 200, message: `already exists user ${params.userEmail}`, id: user.id });
  }
  try {
    const { session } = await req.json();
    if (!session) {
      return NextResponse.json({ status: 400, error: "Invalid session" });
    }
    const { email, name, image } = session.user;
    const user = await addUser(email, name, image);
    return NextResponse.json({ status: 200, message: `successfully created user ${session.email}`, id: user.id });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ status: 500, error: `Error creating user: ${error}` });
  }
}
