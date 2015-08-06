var models = require('../models/models.js');

exports.show = function(req, res, next) {
    var totalQuizes = 0,
        totalComments = 0,
        quizesWithoutComments = 0,
        quizesWithComments = 0;
    
    models.Quiz.count(
    ).then(function(quizes) {
        totalQuizes = quizes;

        return models.Quiz.findAll({
            include: [{
                model: models.Comment
            }]
        });
    }).then(function(quizes) {
        if (totalQuizes) {
            for (var pos in quizes) {
                if (quizes[pos].Comments.length) {
                    ++quizesWithComments;
                } else {
                    ++quizesWithoutComments;
                }
            }
        }
        
        return models.Comment.count();
    }).then(function(valor) {
        totalComments = valor;
            
        res.render('statistics/show.ejs', {
            totalQuizes: totalQuizes,
            totalComments: totalComments,
            commentsByQuiz: (totalComments === 0) ? 0 : totalComments / totalQuizes,
            quizesWithoutComments: quizesWithoutComments,
            quizesWithComments: quizesWithComments,
            errors: []
        });
    }).catch(function(error) {
        next(error);
    });
};