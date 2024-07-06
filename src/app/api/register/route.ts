import { NextRequest, NextResponse } from "next/server";
import { dbConnection } from "@/config/database.config";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await dbConnection();
    await connection.query(
      "INSERT INTO Users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    return NextResponse.json(
      { message: "Usuário registrado com sucesso." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Algo deu errado." }, { status: 500 });
  }
}
