var Handlebars = require('handlebars');
module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) =>{

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 
        'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 
        'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 
        'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html='';
        skills.forEach(skill =>{
            html +=`
                <li ${seleccionadas.includes(skill)? 'class="activo"': ''}>${skill}</li>
            `
        });
        return opciones.fn().html = html;
    },

    tipoContrato: (seleccionado, opciones) =>{
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },

    mostrarAlertas: (errores = {}, alertas) =>{
        const categoria  = Object.keys(errores);
        let html= '';
        if (categoria.length ) {
            errores[categoria].forEach(error =>{
                 if (categoria === 'success') {
                    html +=`<div class="col-lg-5 col-xl-5 mx-auto"align='center'>
                    <div class="alert alert-success alert-dismissible fade show " role="alert">
                        <strong>${error}</strong>
                    </div>
                </div>`
                 }
                 html +=`<div class="col-lg-5 col-xl-5 mx-auto"align='center'>
                 <div class="alert alert-${categoria} alert-dismissible fade show " role="alert">
                     <strong>${error}</strong>
                 </div>
             </div>`
            })
        }
        return alertas.fn().html= html;
    },

}

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});


