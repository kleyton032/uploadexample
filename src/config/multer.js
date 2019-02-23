const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')

const storageTye = {
    //guardo upload localmente
    local: multer.diskStorage({
        //caminho a ser salvo - alteração depois para o AWS3
        destination:(req, file, cb) =>{
            cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
        },
        //criando hash para definir nome de imagens para que não possuam o mesmo nome e não sobrepoem uma a outra(garante que cada imagem tenha um nome único)
        filename:(req, file, cb) =>{
            crypto.randomBytes(16, (err, hash) =>{
                if(err) cb(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`
               
                cb(null,  file.key);
            });
        }
    }),
    //guardo upload no AWS3
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'upload-node-example',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl:'public-read',
        key:(req, file, cb) =>{
            crypto.randomBytes(16, (err, hash) =>{
                if(err) cb(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`
                
                cb(null,  file.key);
            });
        }
    })
}

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: storageTye[process.env.STORAGE_TYPE],
    //limitar tamanho permitidos para arquivos até 2MB
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    //função para limitar tipos de arquivos, chamar função de callback
    fileFilter: (req, file, cb) =>{
        const allowedMines = [
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/gif"

        ];
        if(allowedMines.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error("Tipo do Arquivo Inválido!"))
        }
    }
};