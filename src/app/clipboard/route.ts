import _ from 'lodash';
import { JSONFilePreset } from 'lowdb/node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const {text} = await req.json();
    const defaultData = { paste: '' }
    const db = await JSONFilePreset<{
        paste: string;
    }>('db.json', defaultData)

    db.data.paste = text;
    await db.write();

    return NextResponse.json({
        text: db.data.paste
    });
}

export async function GET() {
    const defaultData = { paste: '' }
    const db = await JSONFilePreset<{
        paste: string;
    }>('db.json', defaultData)

    return NextResponse.json({
        text: db.data.paste
    });
}