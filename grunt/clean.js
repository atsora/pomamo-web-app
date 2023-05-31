module.exports = {
  dist: {
    files: [{
      dot: true,
      src: ['dist-es2015','dist']
    }]
  },
  less: { // Clean tmp files
    files: [{
      dot: true,
      src: ['dist/styles/*.less','dist-es2015/styles/*.less']
    }]
  }
};
