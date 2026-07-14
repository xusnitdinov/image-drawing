# Photo Drawer

Upload an image in the browser and annotate it with drawing tools, then export as PNG.

**Live:** [photo-drawer.vercel.app](https://photo-drawer.vercel.app/)

## Features

- Drag and drop or click to upload
- Brush, shapes, text, and related annotation tools (Fabric.js canvas)
- Color picker and brush size
- Undo / redo
- Export annotated PNG
- PNG / JPG / WebP inputs
- Optional OCR helper via Tesseract.js

## Stack

| Piece | Choice |
|---|---|
| Framework | Next.js + React + TypeScript |
| Canvas | Fabric.js |
| UI | Tailwind / shadcn-style components |
| Host | Vercel |

## Screenshots

![Main screen](https://github.com/user-attachments/assets/e3451a26-bdad-4372-92a0-433fa2190905)

![Drawing in action](https://github.com/user-attachments/assets/a3393802-f737-4561-85bf-f174b5b76ac4)

## Run locally

```bash
git clone https://github.com/xusnitdinov/image-drawing.git
cd image-drawing
pnpm install
pnpm dev
```

## License

MIT
