var LiveUpdateDisabled, LiveUpdateMixin, clientUpdater, fs, incUrlSeq, socketio;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
fs = require("fs");
try {
  socketio = require('socket.io');
} catch (e) {
  socketio = null;
}
incUrlSeq = function(url) {
  var cleanUrl, match, seq, seqRegexp;
  seqRegexp = /--([0-9]+)$/;
  match = url.match(seqRegexp);
  seq = parseInt((match != null ? match[1] : void 0) || 0, 10);
  cleanUrl = url.replace(seqRegexp, "");
  return cleanUrl + ("--" + (seq + 1));
};
clientUpdater = function() {
  var pile;
  console.log("CSS updater is active. Waiting for connection...");
  pile = io.connect('/pile');
  pile.on("connect", function() {
    return console.log("CSS updater has connected");
  });
  pile.on("disconnect", function() {
    return console.log("CSS updater has disconnected! Refresh to reconnect");
  });
  return pile.on("update", function(fileId) {
    var elem;
    elem = document.getElementById("pile-" + fileId);
    if (elem) {
      console.log("updating", fileId, elem);
      return elem.href = PILE.incUrlSeq(elem.href);
    } else {
      return console.log("id", fileId, "not found");
    }
  });
};
LiveUpdateMixin = (function() {
  function LiveUpdateMixin() {}
  LiveUpdateMixin.prototype.installSocketIo = function(userio) {
    var io;
    this.addUrl("/socket.io/socket.io.js");
    this.addOb({
      PILE: {
        incUrlSeq: incUrlSeq
      }
    });
    this.addExec(clientUpdater);
    if (!userio) {
      io = socketio.listen(this.app);
    } else {
      io = userio;
    }
    io.configure(function() {
      return io.set('log level', 0);
    });
    return this.io = io.of("/pile");
  };
  LiveUpdateMixin.prototype.liveUpdate = function(cssmanager, userio) {
    if (this.production) {
      console.log("Not activating live update in production");
      return;
    }
    if (!this.app) {
      throw new Error('JSManager must be bind to a http server (Express app)\
        before it can live update CSS');
    }
    this.installSocketIo(userio);
    return this.app.on("listening", __bind(function() {
      var codeOb, k, pile, _ref, _results;
      console.log("Activating CSS updater");
      _ref = cssmanager.piles;
      _results = [];
      for (k in _ref) {
        pile = _ref[k];
        _results.push((function() {
          var _i, _len, _ref2, _results2;
          _ref2 = pile.code;
          _results2 = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            codeOb = _ref2[_i];
            _results2.push(__bind(function(codeOb) {
              if (codeOb.type !== "file") {
                return;
              }
              console.log("watching " + codeOb.filePath + " for changes");
              return fs.watchFile(codeOb.filePath, __bind(function() {
                console.log("updated", codeOb.filePath);
                return this.io.emit("update", codeOb.getId());
              }, this));
            }, this)(codeOb));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    }, this));
  };
  return LiveUpdateMixin;
})();
LiveUpdateMixin.incUrlSeq = incUrlSeq;
if (socketio != null) {
  module.exports = LiveUpdateMixin;
} else {
  module.exports = LiveUpdateDisabled = (function() {
    function LiveUpdateDisabled() {}
    LiveUpdateDisabled.prototype.liveUpdate = function() {
      return console.log("No socket.io installed. Live update won't work.");
    };
    return LiveUpdateDisabled;
  })();
}