var models = require('../models/models.js');

//Autoload - factoriza el código si la ruta incluye quizID
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(function(quiz) {
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
    condicion = { where: ['upper(pregunta) like upper(?)', search], order: 'pregunta ASC' };
    // con "upper" hago las búsquedas siempre en mayúsculas, para que la búsqueda sea insnesible a mayusculasy minusculas
    search = req.query.search;
  }
  models.Quiz.findAll(condicion).then(function(quizes) {
      res.render('quizes/index', { quizes: quizes });
    }
  ).catch(function(error) { next(error);})
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta.toUpperCase() === req.quiz.respuesta.toUpperCase()) {resultado = 'Correcto';}
  // con "toUpperCase" consigo que larepsuesta sea insensible a minusculasy mayusculas
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};

//GET /author
exports.author = function(req, res) {
	res.render('author',{nombre: 'Manuel Carqués'});
};

//GET /quizes/new
exports.new = function(req, res){
  var quiz = models.Quiz.build( //crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );
  res.render('quizes/new', {quiz: quiz});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

// guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
    res.redirect('/quizes');  // res.redirect: Redirección HTTP a lista de preguntas
  })
};