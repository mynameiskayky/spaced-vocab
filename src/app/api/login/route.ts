import { NextRequest, NextResponse } from "next/server";
import { dbConnection } from "@/config/database.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";

const JWT_SECRET = process.env.JWT_SECRET;

interface User {
  id: number;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const connection = await dbConnection();
    const [users] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );
    const user = users[0] as User;
    const { id, email: userEmail, password: userPassword } = user;

    const isPasswordValid = await bcrypt.compare(password, userPassword);

    if (!isPasswordValid || !JWT_SECRET) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id, email: userEmail }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Algo deu errado." }, { status: 500 });
  }
}
