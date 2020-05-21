//Load express module with `require` directive
const express = require('express')
const app = express()
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

const mongoose = require('mongoose')
const Persona = require('./personas')

const port = process.env.PORT || 8081;
const db_link = "mongodb://mongo:27017/personasdb";
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(db_link, options).then(function () {
    console.log('MongoDB is connected');
})

    .catch(function (err) {
        console.log(err);
    });


// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Personas API",
            description: "Personas",
            contact: {
                name: "cgc9"
            },
            servers: ["http://localhost:8081"]
        }
    },
    apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


//Define request response in root URL (/)
app.get('/', function (req, res) {

    res.send('Hello World!')
})

/**
* @swagger
* /personas:
*  get:
*    description: Obtener todas las personas
*    responses:
*       '200':
*         description: A successful response
*         '500':
*           description: Error in server
*/
app.get('/personas', function (req, res) {
    Persona.find(function (err, personas) {
        if (err) {
            return res.status(500)
        }
        return res.status(200).json(personas);
    });

})
/**
 * @swagger
 * /personas:
 *  post:
 *    description: Crear persona
 *    parameters:
 *      - name: persona
 *        description: Persona object
 *        in: body
 *        type: object
 *        required: true
 *    responses:
 *      '201':
 *        description: creacion exitosa
 *      '500':
 *        description: Error in server
 */
app.post('/personas', function (req, res) {
    var personaNueva = req.body;
    try {
        let persona = new Persona(personaNueva);
        persona.save();
        return res.status(201).json(persona);
    }
    catch (err) {
        return res.status(500)
    }
});


/**
* @swagger    
* /personas/{id}:
*  put:
*    description: Actualizar una persona
*    parameters:
*      - name: id
*        in: path
*        description: Id de la persona
*        required: true
*      - name: persona
*        in: body
*        type: object
*    responses:
*      '201':
*        description: Actualización exitosa
*      '500':
*        description: Error in server
*        content:
*          type: object
*/
app.put('/personas/:id',async function (req, res) {
    var personaId = req.params.id;
    try {
        var personaUp = req.body;
        var persona = await Persona.findByIdAndUpdate(personaId, personaUp, {new: true});
        return res.status(201).json(persona)
    }
    catch (err) {
        return res.status(500)
    }
})

/**
* @swagger    
* /personas/{id}:
*  delete:
*    description: Eliminar una persona
*    parameters:
*      - name: id
*        in: path
*        description: Id de la persona
*        required: true
*    responses:
*      '200':
*        description: Persona eliminada
*      '500':
*        description: Error in server
*        content:
*          type: object
*/
app.delete('/personas/:id',async function (req, res) {
    let personaId = req.params.id;
    try{
        var persona = await Persona.findByIdAndRemove(personaId);
        return res.status(200).json(persona)
    }
    catch (err) {
        return res.status(500)
    }
})

//Launch listening server on port 8081
app.listen(port, function () {
    console.log('app listening on port 8081!')
})