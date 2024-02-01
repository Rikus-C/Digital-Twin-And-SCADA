const {spawn} = require('child_process');

var trendViewer = {};

trendViewer.Launch = function(){
  const python = spawn('python', ['./backend/scripts/python/trend_viewer.py'], {
    shell: true
  });
  python.stdout.on('data', function (data) {
    console.log(data);
  });
  python.on('close', function(){
    console.log("trend Viewer is closed");
  });

}

module.exports = trendViewer; 
