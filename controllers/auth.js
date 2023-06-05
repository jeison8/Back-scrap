const { response } = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/jwt');
// const { Board, Led } = require('johnny-five');
// const board = new Board({ port: "COM3"});


const login = async (req, res = response) => {
    const { document, password } = req.body;   
    try {
        let user = await User.findOne({document});
        if(!user) return message(404,'El documento no esta registrado',res); 
        if(user.document !== '123456789' && user.document !== '000') return message(401,'El usuario no esta autorizado',res) 
        const validPassword = bcrypt.compareSync(password,user.password);
        if(!validPassword) return message(400,'El password no es correcto',res);
        const token = await generateJWT(user.id,user.name);
        res.status(200).json({
            ok:true,
            uid:user.id,
            name:user.name,
            token
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    }
}

const access = async (req, res = response) => {
    const { document } = req.body;
    try {
        let user = await User.findOne({document});
        if(!user) return message(404,'El documento no esta registrado',res);   
        // board.on("ready", () => {
        //     console.log("Ready!");
        //     const led = new Led(13);
        //     led.on();
        // })
        res.status(200).json({
            ok:true,
            name:user.name,
            date:user.dateEnd,
        });
    } catch (error) {
        console.log(error);
        message(500,'Error inesperado comuniquese con el administrador',res);
    }
}

const consult = async (req, res = response) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const nameFilter = req.query.name || ''; 
    const dateFilter = req.query.date || '';
    try {
        let query = {};
        if (nameFilter !== '') query.name = { $regex: nameFilter, $options: 'i' };
        if (dateFilter !== '') query.dateEnd = { $gte: dateFilter };
        const users = await User.paginate(query,{page,limit});
        res.status(200).json({
            ok:true,
            users,
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    }
}

const createUser = async (req, res = response) => { 
    const { document } = req.body;   
    try {
        let user = await User.findOne({document});
        if(user) return message(400,'El documento ya se encuentra registrado',res);
        user = new User(req.body);
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(document,salt);
        await user.save();
        res.status(201).json({
            ok:true,
            uid:user.id,
            name:user.name
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    } 
}

const updateUser = async (req, res = response) => { 
    const id = req.params.id || ''; 
    const { document } = req.body;  
    try {
        let user = await User.findById(id);
        if(!user) return message(400,'No existe el usuario',res);
        const userDocument = await User.findOne({document});
        if(userDocument.id !== id) return message(400,'El documento ya existe',res);
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(document,salt);
        const data = { ...req.body, password: user.password };
        await User.findByIdAndUpdate(id,data,{new:true});
        res.status(201).json({
            ok:true,
            uid:user.id,
            name:user.name
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    } 
}

const destroy = async (req, res = response) => {
    const id = req.params.id || ''; 
    try {
        const user = await User.findByIdAndDelete(id);
        res.status(200).json({
            ok:true,
            user,
        });
    } catch (error) {
        message(500,'Error inesperado comuniquese con el administrador',res);
    }
}

const reValidateToken = async (req, res = response) => {
    const { id, name } = req;
    const token = await generateJWT(id,name);
    res.json({
        ok:true,
        uid,
        name,
        token
    });
}

const message = (code,text,res) => {
    res.status(code).json({
        ok:false,
        message:text
    });
}

module.exports = {
    login,
    access,
    consult,
    createUser,
    updateUser,
    destroy,
    reValidateToken
}
