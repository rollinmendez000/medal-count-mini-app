import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {

        const filePath = path.join(process.cwd(), 'data', 'medals.json');
        const content = fs.readFileSync(filePath, 'utf8');

        return NextResponse.json(JSON.parse(content));

    } catch (error) {
        console.log(error);
        return NextResponse.error();
    }
}