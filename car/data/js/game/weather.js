export const WEATHER = {
  mode: 'CLEAR',
  gripMul: 1,
  set(mode) {
    this.mode = mode;
    this.gripMul = mode === 'RAIN' ? 0.82 : 1;
  }
};
