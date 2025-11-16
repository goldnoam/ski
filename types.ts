
export enum EntityType {
  Snowman = 'snowman',
  Carrot = 'carrot',
  Bullet = 'bullet',
  Husky = 'husky',
  Cat = 'cat',
  Fox = 'fox',
  PolarBear = 'polar_bear',
  PowerUp = 'powerup',
  Trail = 'trail',
}

export interface GameEntity {
  id: number;
  type: EntityType;
  x: number; // position across the screen (-50 to 50)
  z: number; // position down the slope (0 to 100)
  y: number; // height off the ground
  vx?: number; // horizontal velocity
  life?: number; // for effects like trails
  maxLife?: number; // for effects like trails
  variant?: number; // for visual variations
}

export interface PlayerState {
  y: number; // height off the ground (for jumping)
  isJumping: boolean;
  jumpVelocity: number;
  x: number; // side-to-side position
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';