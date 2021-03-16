const passport = require('passport');
const mongoose= require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

//revisar si el usuario esta autenticado

exports.verificarUsuario =(req,res,next) =>{
    //revisar el usuario
    if (req.isAuthenticated()) {
        return next(); //estan autenticados
    }
    res.redirect('/iniciar-sesion');
}

exports.isNotLoggedIn =(req,res,next) =>{
    //revisar el usuario
    if (!req.isAuthenticated()) {
        return next(); //estan autenticados
    }
    res.redirect('/administracion');
}

exports.mostrarPanel = async(req,res)=>{

    //consultar el usuario autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline:'Crea y administra tus vacantes desde aqui',
        nombre: req.user.nombre,
        imagen:req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion= (req, res) =>{
    req.logout();
    req.flash('success', 'Cerrrastes sesión correctamente');
    return res.redirect('/iniciar-sesion');
}

//reestablecer password
exports.formReestablecerPassword = (req, res) =>{
    res.render('reestablecer-password',{
        nombrePagina:'Reestablece tu password',
        tagline:'Si ya tienes una cuenta pero olvidastes tu contraseña coloca tu email'
    })
}

//Generar el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('warning', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    // Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Todo correcto
    req.flash('info', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

//validar si el token es valido y si usuarion existe
exports.reestablecerPassword = async( req, res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if (!usuario) {
        req.flash('warning', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Contraseña'
    })
}

exports.guardarPassword= async ( req, res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira:{
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('warning', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();
    req.flash('success', 'Contraseña Modificado Correctamente');
    res.redirect('/iniciar-sesion');
}