const { response } = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/jwt');
const { SerialPort } = require('serialport');
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });


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
        if(!user) return message(404,'La clave de ingreso es incorrecta',res);   
        const today = new Date().setHours(0,0,0,0);
        if(user.dateEnd.getTime() >= today) port.write('1');
        if(user.document === '123456789' || user.document === '000') port.write('1');
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
        const users = await User.paginate(query,{page,limit,sort: { dateEnd: 1 }});
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
        if(userDocument && userDocument.id !== id) return message(400,'El documento ya existe',res);
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

const clean = async () => {
    const today = new Date();
    const day = today.getDate();
    if (day === 1 || day === 28) {
        const thresholdDate = new Date(); 
        thresholdDate.setHours(0,0,0,0);
        thresholdDate.setDate(today.getDate() - 90); 
        const users = await User.find({ dateEnd: { $lte: thresholdDate } });
        users.forEach(async (user) => {
            if (user.document !== '123456789' && user.document !== '000'){
                await User.findByIdAndDelete(user.id);
            }
        });
    }
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
    reValidateToken,
    clean
}
