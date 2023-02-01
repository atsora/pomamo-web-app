module.exports = {
  dist: {
    files: [{
      dot: true,
      src: ['dist-es2015','dist']
    }]
  },
  babel: {
    files: [{
      dot: true,
      src: ['dist/babel']
    }]
  },
  less: { // Clean tmp files
    files: [{
      dot: true,
      src: ['dist/styles/*.less','dist-es2015/styles/*.less']
    }]
  }
};
