module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // react-native-reanimated/plugin DEBE ser el último plugin del array.
        // Si no está en esta posición, los SharedValue se inicializan incorrectamente
        // y causan el error: "this._listeners.forEach is not a function"
        'react-native-reanimated/plugin',
      ],
    };
  };