/* const Vacante = require('../models/Vacantes'); */
const mongoose= require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante= (req,res) =>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante' 
    });
}

// agrega las vacantes a la base de datos
exports.agregarVacante= async (req,res)=>{
    const vacante = new Vacante(req.body);

    //usuario autor de la vacante
    vacante.autor = req.user._id;

    //crear arreglos de skills
    vacante.skills = req.body.skills.split(',');

    // almacenar en la base de datos
    const nuevaVacante= await vacante.save()

    //redireccionar
    req.flash('success', 'Guardado Correctamente');
    res.redirect(`/vacantes/${nuevaVacante.url}`)
    
}

exports.mostrarVacante = async(req, res, next) =>{
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean();
    // si no hay resultados 
    if (!vacante) return next();

    res.render('vacante',{
        vacante,
        nombrePagina: 'Datos de Vacante'
    })
}

exports.listaMostrarVacantes = async(req, res, next) =>{
    const vacante = await Vacante.find().lean();
    // si no hay resultados 
    if (!vacante) return next();

    res.render('listadovacantes',{
        vacante,
        nombrePagina: 'Datos de Vacante'
    })

    
}

exports.formEditarVacante = async(req, res,next)=>{
    const vacante = await Vacante.findOne({url: req.params.url}).lean();
    if (!vacante) return next();

    res.render('editar-vacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`
    });
}

exports.editarVacante = async (req, res)=>{
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');
    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, 
        vacanteActualizada, {
            new: true,
            runValidators: true
        });
        req.flash('success', 'Editado Correctamente');
        res.redirect(`/vacantes/${vacante.url}`);
}

//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) =>{
    //sanitizar los campos

    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    //validar 
    req.checkBody('titulo','Agregar un titulo a la vacante').notEmpty();
    req.checkBody('empresa','Agregar una Empresa').notEmpty();
    req.checkBody('ubicacion','Agregar una Ubicacion').notEmpty();
    req.checkBody('contrato','Selecciona el tipo de contrato').notEmpty();
    req.checkBody('skills','Agrega una habilidad').notEmpty();
    const errores = req.validationErrors();
    if (errores) {
        //recargar la vista con los errores
        req.flash('warning', errores.map(error => error.msg));
        res.render('nueva-vacante',{
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            mensajes: req.flash(),
        })
    }

    next();
}

exports.eliminarVacante = async(req,res) =>{
    const{id} = req.params;
    const vacante = await Vacante.findById(id);

    if (verificarAutor(vacante, req.user)) {
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    }else{
        res.status(403).send('Error');
    }
}

const verificarAutor = (vacante = {}, usuario = {}) =>{
    if (!vacante.autor.equals(usuario._id)) {
        return false
    }
    return true;
}

//subir archivo en pdf

exports.subirCV = (req,res, next)=>{
    upload(req, res, function(error){
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('warning', 'El archivo es muy grande: Maximo 100Kb')
                }else{
                    req.flash('warning', error.message);
                }
            }else{
                req.flash('warning', error.message);
            }
            res.redirect('back');
            return
        }else{
            return next();
        }
    })
}

const configuracionMulter = {
    limits:{ fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb)=>{
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file,cb)=>{
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file,cb){
        if (file.mimetype === 'application/pdf') {
           
            cb(null, true);
        }else{
            cb(new Error('formato no valido, tiene que ser extension PDF'))
        }
    }
}

const upload = multer(configuracionMulter).single('cv'); 


//almacenar los candidatos en la bd
exports.contactar= async(req, res, next)=>{
   const vacante = await Vacante.findOne({url: req.params.url});

   //sino existe la vacante
   if (!vacante) return next();

   const nuevoCandidato = {
       nombre: req.body.nombre,
       email: req.body.email,
       cv: req.file.filename
   }

   // almacenar la vacante
   vacante.candidatos.push(nuevoCandidato);
   await vacante.save();

   // mensaje falsh y redireccion

   req.flash('success', 'Se envio tu curriculum correctamente');
   res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) =>{
    const vacante = await Vacante.findById(req.params.id).lean();

    if (vacante.autor === req.user._id.toString()) {
        return next();   
    }

    if(!vacante) return next();

    res.render('candidatos',{
        nombrePagina:`Candidatos vacantes - ${vacante.titulo}`,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

//buscador vacantes
exports.buscarVacantes= async(req, res)=>{
    const vacantes = await Vacante.find({
        $text:{
            $search: req.body.q
        }
    }).lean()
    
    // mostrar las vacantes
    res.render('buscador',{
        nombrePagina: `Resultados para la busqueda:${req.body.q}`,
        tagline: 'Encuentra y Publica trabajos para desarrolladores web',
        vacantes
    })
}