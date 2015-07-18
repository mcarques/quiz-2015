var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* Página de inicio */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

// Creditos
router.get('/author', quizController.author);

// Autoload decomandos con quizId
router.param('quizId', quizController.load);	//autoload :quizId

// Definición de rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);

module.exports = router;
