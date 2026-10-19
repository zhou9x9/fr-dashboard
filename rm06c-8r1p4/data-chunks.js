(function(){
  var src = (document.currentScript && document.currentScript.src) || '';
  var match = src.match(/[?&]v=([^&]+)/);
  var version = match ? decodeURIComponent(match[1]) : String(Date.now());
  var files = ["data_chunks/api_001.js","data_chunks/api_002.js","data_chunks/api_003.js","data_chunks/api_004.js","data_chunks/event_parameter_001.js","data_chunks/event_parameter_002.js","data_chunks/event_parameter_003.js","data_chunks/event_parameter_004.js","data_chunks/event_parameter_005.js","data_chunks/event_parameter_006.js","data_chunks/event_parameter_007.js","data_chunks/event_parameter_008.js","data_chunks/event_parameter_009.js","data_chunks/event_parameter_010.js","data_chunks/event_parameter_011.js","data_chunks/event_parameter_012.js","data_chunks/event_parameter_013.js","data_chunks/event_parameter_014.js","data_chunks/event_parameter_015.js","data_chunks/event_parameter_016.js","data_chunks/event_parameter_017.js","data_chunks/event_parameter_018.js","data_chunks/event_parameter_019.js","data_chunks/event_parameter_020.js","data_chunks/event_parameter_021.js","data_chunks/event_parameter_022.js","data_chunks/event_parameter_023.js","data_chunks/event_parameter_024.js","data_chunks/event_parameter_025.js","data_chunks/event_parameter_026.js","data_chunks/event_parameter_027.js","data_chunks/event_parameter_028.js","data_chunks/playback_001.js"];
  document.write(files.map(function(file) {
    return '<script src="./' + file + '?v=' + encodeURIComponent(version) + '"><\/script>';
  }).join(''));
})();
