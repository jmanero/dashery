
exports.attach = function(app) {
  app.get('/', function(req, res, next) {
    res.render('index.ejs');
  });

  app.get('/notify', function(req, res, next) {
    res.render('notify.ejs');
  });
};
