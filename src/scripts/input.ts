export const keys: { [key: string]: boolean } = {};
export const actions: { [action: string]: string } = {
  forward: "w",
  back: "s",
  left: "a",
  right: "d",
  jump: " ",
};

export function initInput() {
  document.onkeydown = (e) => {
    keys[e.key.toLowerCase()] = true;
  };
  document.onkeyup = (e) => {
    keys[e.key.toLowerCase()] = false;
  };
}
