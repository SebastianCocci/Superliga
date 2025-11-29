import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  const newUser = await User.create(data);
  return NextResponse.json(newUser);
}
