/**
 * Display API
 */
var context = exports._context = {};

exports.attach = function(app, io) {
  // The display app
  app.get('/display/:id', function(req, res, next) {
    res.render('display.ejs', {
      id: req.params.id
    });
  });

  // Display app data
  app.get('/display/:id/boards.json', function(req, res, next) {
    res.json({
      '881cc2ae-37f6-49b0-850d-fd8fa169c87a': {
        url: 'https://p.datadoghq.com/sb/04008157a2?tv_mode=true',
        position: 0,
        linger: 10,
        refresh: false
      },
      '78eb2ee9-cd8c-4eed-af0d-f8e4492bad23': {
        url: 'https://p.datadoghq.com/sb/76001563f8?tv_mode=true',
        position: 1,
        linger: 10,
        refresh: false
      },
      'febd72db-d501-4093-a4e9-6624a54d465f': {
        url: 'https://p.datadoghq.com/sb/9838f8665c?tv_mode=true',
        position: 2,
        linger: 10,
        refresh: false
      },
      '37cea47e-a2f8-4452-b2fc-4b280f92fc05': {
        url: 'https://p.datadoghq.com/sb/a9ceb586be?tv_mode=true',
        position: 3,
        linger: 10,
        refresh: false
      },
      '839bab35-a976-43aa-9009-100dacb6bafc': {
         url: 'http://fucksasaservice.co/html',
         position: 4,
         linger: 10,
         refresh: 30
       }
    });
  });

  app.get('/display/:id/events.json', function(req, res, next) {
    res.json({

    });
  });

  // Display status
  io.of('/display').on('connection', function(socket) {
    // Join global feeds
    socket.join('events:global');
    socket.join('control:global');

  });
};
