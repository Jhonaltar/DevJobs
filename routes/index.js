const express = require('express');
const router = express.Router();
const homeControllers = require('../controllers/homeControllers');
const vacantesController = require('../controllers/vacantesController');
const usuarioController = require('../controllers/usuarioController');
const authController = require('../controllers/authController');


module.exports = () =>{
    router.get('/', homeControllers.mostrarTrabajos);

    //crear vacantes
    router.get('/vacantes/nueva', 
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante);

    router.post('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante);
    //mostrar vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    router.get('/listvacantes',vacantesController.listaMostrarVacantes)

    //editar vacante
    router.get('/vacantes/editar/:url',
    authController.verificarUsuario, 
    vacantesController.formEditarVacante);

    router.post('/vacantes/editar/:url', 
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.editarVacante);

    //eliminar vacantes
    router.delete('/vacantes/eliminar/:id',
    vacantesController.eliminarVacante)

    //crear cuentas
    router.get('/crear-cuenta', 
    authController.isNotLoggedIn,
    usuarioController.formCrearCuenta);
    router.post('/crear-cuenta',
    usuarioController.validarRegistro,
    usuarioController.crearUsuario);

    //autenticar usuarios.
    router.get('/iniciar-sesion', 
    authController.isNotLoggedIn,
    usuarioController.formIniciarSesion);
    router.post('/iniciar-sesion', 
    authController.autenticarUsuario);

    //cerrar sesion
    router.get('/cerrar-sesion', 
    authController.verificarUsuario,
    authController.cerrarSesion)

    // Resetear password
    router.get('/reestablecer-password',
    authController.formReestablecerPassword);
    router.post('/reestablecer-password',
    authController.enviarToken)

    // Resetear password (almacenar en la bd)
    router.get('/reestablecer-password/:token',
    authController.reestablecerPassword);
    router.post('/reestablecer-password/:token',
    authController.guardarPassword);


    //panel de administrador
    router.get('/administracion', 
    authController.verificarUsuario,
    authController.mostrarPanel);

    //editar perfil
    router.get('/editar-perfil',
    authController.verificarUsuario,
    usuarioController.formEditarPerfil);

    router.post('/editar-perfil',
    authController.verificarUsuario,
    /* usuarioController.validarPerfil, */
    usuarioController.subirImagen,
    usuarioController.editarPerfil);

    //recibir mensaje de candidatos
    router.post('/vacantes/:url',
    vacantesController.subirCV,
    vacantesController.contactar);

    //mostrar candidatos
    router.get('/candidatos/:id',
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos);

    //buscador de vacantes
    router.post('/buscador', 
    vacantesController.buscarVacantes);

    return router;
}