var models = require('../models/models.js');

//Autoload - factoriza el código si la ruta incluye quizID
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: { id: Number(quizId) },
            include: [{ model: models.Comment }]
        }).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else { next(new Error('No existe quizId=' + quizId));}
  }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
    var condicion = {};
    var search = '';
  if (req.query && req.query.search) {  //comprueba que existe un texto para buscar
    search = '%' + req.query.search.split(/\s+/).join('%') + '%';
    // split(" ") crea un array con elementos separados por un espacio en blanco creado con la barra espaciadora
    // split(/\s+/) los espacios en blanco pueden haberse creado de cualquier forma (p.e. tabulador)
    // El signo + ignora varios espacios seguidos
    // joint une la cadena utilizando %
    condicion = { where: ['LOWER(pregunta) like ?', search.toLowerCase()], order: 'tipo ASC, pregunta ASC' };
    // con "LOWER" hago las búsquedas siempre en minúsculas, para que la búsqueda sea insensible a mayusculas y minusculas
    search = req.query.search;
  }
  models.Quiz.findAll(condicion).then(function(quizes) {
      res.render('quizes/index', { quizes: quizes, errors: [] });
    }
  ).catch(function(error) { next(error);})
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
    resultado = 'Correcto';}
  // con "toLowerCase()" consigo que la respuesta sea insensible a minusculas y mayusculas
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /author
exports.author = function(req, res) {
	res.render('author',{nombre: 'Manuel Carqués', errors: [] });
};

//GET /quizes/new
exports.new = function(req, res){
  var quiz = models.Quiz.build( //crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );
  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tipo"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tipo = req.body.quiz.tipo;

  req.quiz.validate().then(function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tipo"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    for (var i in req.quiz.Comments) {  // Este bucle borra los comentarios asociados a la pregunta borrada
      req.quiz.Comments[i].destroy();
    };
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};