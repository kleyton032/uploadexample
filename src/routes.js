const routes = require('express').Router();
const multer = require('multer')
const multerConfig = require('./config/multer')

const Post = require('./models/Post')

//listando todos os posts
routes.get('/posts', async (req, res)=>{
    const posts = await Post.find();
    return res.json(posts);
})


//rota para inserção do file dentro do mongodb
routes.post('/posts', multer(multerConfig).single('file'), async (req, res) =>{
    const {originalname: name, size, key, location: url = ""} = req.file;
    const post = await Post.create({
        name,
        size,
        key,
        url
    })    
    return res.json(post)
})

//removendo upload
routes.delete('/posts/:id', async (req, res) =>{
    const postRemove = await Post.findById(req.params.id)

    await postRemove.remove();

    return res.send();

})

module.exports = routes;