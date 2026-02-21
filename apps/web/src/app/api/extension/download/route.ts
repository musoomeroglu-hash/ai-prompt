import { NextResponse } from 'next/server'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import JSZip from 'jszip'

const EXCLUDED_EXTENSIONS = ['.ps1', '.DS_Store']
const EXCLUDED_DIRS = ['.git']

function addFolderToZip(zip: JSZip, folderPath: string, basePath: string) {
    const entries = readdirSync(folderPath)

    for (const entry of entries) {
        const fullPath = join(folderPath, entry)
        const relativePath = relative(basePath, fullPath)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(entry)) {
                addFolderToZip(zip, fullPath, basePath)
            }
        } else {
            if (!EXCLUDED_EXTENSIONS.some(ext => entry.endsWith(ext))) {
                const content = readFileSync(fullPath)
                zip.file(relativePath, content)
            }
        }
    }
}

export async function GET() {
    try {
        const extensionDir = join(process.cwd(), '..', 'extension')

        const zip = new JSZip()
        addFolderToZip(zip, extensionDir, extensionDir)

        const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 },
        })

        return new NextResponse(zipBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="antigravity-extension-v2.0.0.zip"',
                'Content-Length': zipBuffer.length.toString(),
            },
        })
    } catch (error: any) {
        console.error('Extension download error:', error)
        return NextResponse.json(
            { error: 'Extension dosyası bulunamadı' },
            { status: 500 }
        )
    }
}
