const sharp = require('sharp');
const fs = require('fs');

const compressImage = async (req, res, next) => {
    if(!req.file) {
        return next();
    };
   try {
 
        await sharp(req.file.path) 
            .resize({
                width: 470,
                height: 600,
            })
            .webp({ quality: 80 })
            .toFile(`${req.file.path.split('.')[0]}compress.webp`)
            .then(() => {
                fs.unlink(req.file.path, (err) => {
                    if(err) {
                        console.log(err);
                    };
                    next();
                });
            })

        } catch (error) {
             res.status(500).json({ error });
        };
};

module.exports = compressImage;