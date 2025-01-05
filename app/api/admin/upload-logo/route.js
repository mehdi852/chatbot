import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { checkIfUserIsAdmin } from '@/utils/authUtils';
import { revalidatePath } from 'next/cache';
export async function POST(request) {
    const { authorized, message, status } = await checkIfUserIsAdmin(request);

    // revalidate path
    revalidatePath('/');

    if (!authorized) {
        return NextResponse.json({ message }, { status });
    }
        try {
        const formData = await request.formData();
        const file = formData.get('logo');

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Get file extension from uploaded file
        const fileExt = getFileExtension(file.name);
        
        // Set consistent filename
        const filename = `logo${fileExt}`;
        const publicDir = join(process.cwd(), 'public', 'uploads');
        const filePath = join(publicDir, filename);
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Delete old logo if it exists
        if (existsSync(filePath)) {
            try {
                await unlink(filePath);
            } catch (error) {
                console.error('Error deleting old logo:', error);
                // Continue with upload even if delete fails
            }
        }
        
        // Save new logo
        await writeFile(filePath, buffer);
        
        // Return the consistent public URL
        const logoUrl = `/uploads/${filename}`;

        return NextResponse.json({ logoUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        );
    }
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1);
} 