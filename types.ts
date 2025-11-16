
export enum EntityType {
  Snowman = 'snowman',
  Carrot = 'carrot',
  Hill = 'hill',
  Bullet = 'bullet',
}

export interface GameEntity {
  id: number;
  type: EntityType;
  x: number; // position across the screen (-50 to 50)
  z: number; // position down the slope (0 to 100)
  y: number; // height off the ground
}

export interface PlayerState {
  y: number; // height off the ground (for jumping)
  isJumping: boolean;
  jumpVelocity: number;
  x: number; // side-to-side position
}

export type GameStatus = 'idle' | 'playing' | 'gameOver';
