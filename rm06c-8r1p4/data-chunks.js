(function(){
  var src = (document.currentScript && document.currentScript.src) || '';
  var match = src.match(/[?&]v=([^&]+)/);
  var version = match ? decodeURIComponent(match[1]) : String(Date.now());
  var files = ["data_chunks/api_001.js","data_chunks/event_parameter_001.js","data_chunks/event_parameter_002.js","data_chunks/event_parameter_003.js","data_chunks/event_parameter_004.js","data_chunks/event_parameter_005.js","data_chunks/playback_001.js"];
  document.write(files.map(function(file) {
    return '<script src="./' + file + '?v=' + encodeURIComponent(version) + '"><\/script>';
  }).join(''));
})();
