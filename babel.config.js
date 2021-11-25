
/*
* Copyright (c) 2020-present unTill Pro, Ltd.
*/

module.exports = {
  "presets": ["@babel/preset-react", [
    '@babel/preset-env',
    {
      targets: {
        node: 'current',
      },
    },
  ]],
  "plugins": ["@babel/plugin-transform-react-jsx"]
};