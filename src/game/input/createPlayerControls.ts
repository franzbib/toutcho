import Phaser from 'phaser';

export type PlayerControls = {
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  up: Phaser.Input.Keyboard.Key[];
  down: Phaser.Input.Keyboard.Key[];
  interact: Phaser.Input.Keyboard.Key;
  confirm: Phaser.Input.Keyboard.Key;
  choice1: Phaser.Input.Keyboard.Key;
  choice2: Phaser.Input.Keyboard.Key;
  choice3: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
};

export type MenuControls = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  confirm: Phaser.Input.Keyboard.Key;
  back: Phaser.Input.Keyboard.Key;
};

function requireKeyboard(scene: Phaser.Scene): Phaser.Input.Keyboard.KeyboardPlugin {
  const keyboard = scene.input.keyboard;

  if (!keyboard) {
    throw new Error('Keyboard input is unavailable in this scene.');
  }

  return keyboard;
}

export function createPlayerControls(scene: Phaser.Scene): PlayerControls {
  const keyboard = requireKeyboard(scene);

  return {
    left: [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
    ],
    right: [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    ],
    up: [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
    ],
    down: [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    ],
    interact: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    confirm: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    choice1: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    choice2: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    choice3: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
  };
}

export function createMenuControls(scene: Phaser.Scene): MenuControls {
  const keyboard = requireKeyboard(scene);

  return {
    up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    confirm: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    back: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
  };
}

function isAnyKeyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
  return keys.some((key) => key.isDown);
}

export function getMovementVector(controls: PlayerControls): Phaser.Math.Vector2 {
  const x = Number(isAnyKeyDown(controls.right)) - Number(isAnyKeyDown(controls.left));
  const y = Number(isAnyKeyDown(controls.down)) - Number(isAnyKeyDown(controls.up));

  const vector = new Phaser.Math.Vector2(x, y);

  if (vector.lengthSq() > 1) {
    vector.normalize();
  }

  return vector;
}

