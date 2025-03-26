import fs from 'fs';

export async function GET() {
  const files = fs.readdirSync('/tmp');

  return Response.json({
    files
  });
}
