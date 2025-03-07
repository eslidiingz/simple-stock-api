import sharp from 'sharp'

export const generateFilename = (_file?: string): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:ZT.]/g, "");
  const random = Math.floor(Math.random() * 10000);
  const filename = `${timestamp}${random.toString().padStart(4, '0')}`;

  const extension = _file ? getFileExtension(_file) : '';

  return `${filename}${extension}`;
}

export const getFileExtension = (_file: string): string => `.${_file?.split('.').pop()}`;

export const uploadFile = async (_directory: string, _file: File, _makeThumbnail: boolean = false): Promise<{ imagePath: string, thumbPath: string }> => {
  const filename = generateFilename(_file.name);
  const filePath = `./public/uploads/${_directory}/${filename}`;
  const imagePath = `./public/uploads/${_directory}/file_${filename}`

  let thumbPath = '';

  await Bun.write(filePath, await _file.arrayBuffer());

  await sharp(filePath)
    .resize({ width: 1200 })
    .toFile(imagePath);

  if (_makeThumbnail) {
    thumbPath = `./public/uploads/${_directory}/thumb_${filename}`

    await sharp(filePath)
      .resize({ width: 200 })
      .toFile(thumbPath);
  }

  await Bun.file(filePath).delete();

  return {
    imagePath: imagePath.replace('./public', ''),
    thumbPath: thumbPath.replace('./public', '')
  }
}

export const deleteFile = async (filePath: string) => {
  await Bun.file(`./public${filePath}`).delete();
}