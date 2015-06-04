(function(global) {
  function Display(id, container) {
    this.id = id;
    this.container = $(container);
    this.socket = io(':/display');

    this.current = -1;
    this.boards = false;
    this.events = false;
    this.order = [];
  }

  function Board(display, id, params) {
    this.display = display;

    this.id = id;
    this.url = params.url;
    this.order = params.order;
    this.linger = +(params.linger) || 10;
    this.refresh = +(params.refresh) || false;

    var frame = this.frame = $('<iframe></iframe>');
    frame.addClass('board-frame').addClass('collapse');
    frame.attr('src', this.url);
    frame.attr('id', 'board-frame-' + id);
  }

  Board.prototype.attach = function() {
    var board = this;
    var container = this.display.container;

    container.append(board.frame);
    if (board.refresh) {
      board._refresh = setInterval(function() {
        console.log('Refreshing board ' + board.id);
        board.reload();
      }, board.refresh * 1000);
    }
  };

  Board.prototype.deattach = function() {
    this.frame.remove();
    clearInterval(this._refresh);

    return this;
  };

  Board.prototype.show = function(cb) {
    this.frame.fadeIn('slow', cb);

    return this;
  };

  Board.prototype.hide = function(cb) {
    this.frame.fadeOut('slow', cb);

    return this;
  };

  Board.prototype.reload = function() {
    this.frame.attr('src', this.url);

    return this;
  };

  Display.prototype.getBoards = function(update, callback) {
    var display = this;

    if(update instanceof Function) {
      callback = update;
      update = false;
    } else if (!update && display.boards) {
      return callback(null, display.boards);
    }

    $.ajax('/display/' + display.id + '/boards.json', {
      accepts: 'application/json',
      contentType: 'application/json',
      dataType: 'json',
      method: 'GET',
      error: function(xhr, status, error) {
        if (typeof error == 'string') {
          error = new Error(error);
          error.status = status;
        }

        callback(error);
      },
      success: function(data, status, xhr) {
        display.boards = Object.keys(data).reduce(function(boards, id) {
          boards[id] = new Board(display, id, data[id]);
          return boards;
        }, {});

        // Sorted set of board IDs
        display.order = Object.keys(display.boards).sort(function(a, b) {
          return (display.boards[a].position > display.boards[b].position) ? 1 : -1;
        });

        callback(null, display.boards);
      }
    });
  };

  Display.prototype.getEvents = function(update, callback) {
    var display = this;

    if(update instanceof Function) {
      callback = update;
      update = false;
    } else if (!update && display.events) {
      return callback(null, display.events);
    }

    $.ajax('/display/' + display.id + '/events.json', {
      accepts: 'application/json',
      contentType: 'application/json',
      dataType: 'json',
      method: 'GET',
      error: function(xhr, status, error) {
        if (typeof error == 'string') {
          error = new Error(error);
          error.status = status;
        }

        callback(error);
      },
      success: function(data, status, xhr) {
        display.events = data;
        callback(null, data);
      }
    });
  };

  Display.prototype.start = function() {
    var display = this;
    console.log('Starting display ' + this.id);

    // Load boards and start carousel
    display.getBoards(function(err) {
      Object.keys(display.boards).forEach(function(id) {
        display.boards[id].attach();
      });

      display.carousel();
    });

    // Load and subscribe to event streams
    display.getEvents(function(err, events) {
      console.log(events);
    });

    return this;
  };

  Display.prototype.carousel = function() {
    var display = this;

    (function loop() {
      display.current += 1;
      display.current %= display.order.length;

      var board = display.boards[display.order[display.current]];
      console.log('Show board ' + board.id);
      board.show();

      display._carousel = setTimeout(function() {
        console.log('Hide board ' + board.id);
        board.hide(function() {
          loop();
        });
      }, board.linger * 1000);
    })();

    return this;
  };

  Display.prototype.stop = function(cb) {
    clearTimeout(this._carousel);
    display.order[display.current].hide(cb);

    return this;
  };

  // Export
  global.Display = Display;
})(window);
