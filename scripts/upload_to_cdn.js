const cloudinary = require('cloudinary').v2;

const filePath = process.argv;
if (!filePath) {
  console.error('Error: File path argument missing');
  process.exit(1);
}

cloudinary.config();

cloudinary.uploader.upload(filePath, {
  resource_type: 'video',
  folder: 'instagram_reels'
})
.then(result => {
  if (!result.secure_url) {
    console.error('Upload failed, no secure_url returned:', result);
    process.exit(1);
  }
  console.log(result.secure_url);
})
.catch(err => {
  console.error('Cloudinary upload error:', err);
  process.exit(1);
});
