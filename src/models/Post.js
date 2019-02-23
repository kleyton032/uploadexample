const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs')
const path = require('path')

const {promisify} = require('util')

const s3 = new aws.S3();

//criando collection do mongo 
const PostSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt:{
        type: Date,
        default: Date.now
    }
});

PostSchema.pre('save', function(){
    if(!this.url){
        this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
});

//método responsável por quando fizer um delete, também apagar do aws3
PostSchema.pre('remove', function(){
    if(process.env.STORAGE_TYPE == 's3'){
        return s3.deleteObject({
            Bucket: 'upload-node-example',
            Key: this.key,
        }).promise()
    }else{
        //deletando arquivo do local
        return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
    }
});

//exportando o módulo
module.exports = mongoose.model('Post', PostSchema)