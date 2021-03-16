const mongoose= require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');

exports.subirImagen=(req,res, next) =>{
    upload(req, res,function(error){
        if (error) {
            if (error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('warning', 'El archivo es muy grande: Maximo 100Kb');
                }else{
                    req.flash('warning', error.message);
                }
            }else{
                req.flash('warning', error.message);
            }
            res.redirect('/administracion');
            return;
        }else{
            return next();
        }
    });
    
}

// opciones de multer
const configuracionMulter ={
    limits: {fileSize: 150000},
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req,file,cb){
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true)
        }else{
            cb(new Error('Formato no valido') , false)
        }
    }
}


const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) =>{
    res.render('crear-cuenta',{
        nombrePagina: 'Crear Cuenta',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
    })

}

exports.validarRegistro = (req,res,next) =>{
    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    //validar
     req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
     req.checkBody('email','El email debe ser valido').isEmail();
     req.checkBody('password','Password no puede ir vacio').notEmpty();
     req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
     req.checkBody('confirmar','El password es diferente').equals(req.body.password);
     const errores = req.validationErrors();
     if (errores) {
         //si hay eroores
         req.flash('warning', errores.map(error => error.msg));
         res.render('crear-cuenta',{
            nombrePagina: 'Crear Cuenta',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
         })
         return;
     }
     //si toda la validacion es correcta
     next();
}

exports.crearUsuario = async (req, res) => {
    // crear el usuario
    const usuario = new Usuarios(req.body);
    console.log(usuario);
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('warning', error);
        res.redirect('/crear-cuenta');
    }
}

//formulario para inciar sesion

exports.formIniciarSesion = (req,res) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesión DevJobs',
        tagline: 'Navega y visita puestos de trabajo y aprovecha la oportunidad.',
    })
}

// editar perfil
exports.formEditarPerfil =(req, res) =>{
    res.render('editar-perfil',{
        nombrePagina:'Editar tu perfil en DevJbos',
        usuario: req.user.toObject(),
        nombre: req.user.nombre,
        imagen:req.user.imagen
    })
}

//guardar cambios editar perfil
exports.editarPerfil = async(req, res) =>{
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email= req.body.email;
    usuario.empresa = req.body.empresa;
    usuario.direccion = req.body.direccion;
    usuario.graduado= req.body.graduado
    if (req.body.password) {
        usuario.password = req.body.password
    }
    
    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    await usuario.save();
    req.flash('success', 'Cambios Guardados correctamente.')

    res.redirect('/administracion');
}

//sanitizar y validar el formulario de editar perfiles

exports.validarPerfil = (req,res, next) =>{

    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('direccion').escape();
    req.sanitizeBody('graduado').escape();

    if (req.body.password) {
        req.sanitizeBody('password').escape();
    }

    req.checkBody('nombre','El nombre no puede ir vacio').notEmpty(); 
    req.checkBody('email','El correo no puede ir vacio').notEmpty();
    req.checkBody('empresa','El nombre de la empresa no puede ir vacio').notEmpty(); 
    req.checkBody('direccion','La direccion no puede ir vacio').notEmpty();
    req.checkBody('graduado','La titulo de graduación no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if (errores) {
        req.flash('warning', errores.map(error =>error.msg)); 
        res.render('editar-perfil',{
            nombrePagina:'Editar tu perfil en DevJbos',
            usuario: req.user.toObject(),
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen:req.user.imagen
        })
    }
    next();
}