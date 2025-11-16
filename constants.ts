export const LEVEL_DURATION = 15; // seconds
export const INITIAL_SPEED = 0.05;
export const SPEED_INCREMENT = 0.01;
export const MAX_Z = 100;
export const HORIZON_Y = 40; // percentage from top

// Player physics
export const JUMP_FORCE = 2.5;
export const GRAVITY = 0.1;
export const PLAYER_MOVE_SPEED = 0.8;
export const PLAYER_Z_POSITION = MAX_Z - 5;

// Scoring & Lives
export const CARROT_SCORE = 10;
export const SNOWMAN_SCORE = 50;
export const HUSKY_SCORE = 75;
export const CAT_SCORE = 100;
export const ENEMY_COLLISION_PENALTY = 100;
export const INITIAL_LIVES = 5;


// Game object dimensions (for collision)
export const PLAYER_WIDTH = 8;
export const PLAYER_HEIGHT = 10;
export const SNOWMAN_WIDTH = 10;
export const HUSKY_WIDTH = 12;
export const CAT_WIDTH = 8;
export const CARROT_WIDTH = 5;
export const BULLET_WIDTH = 3;

// Firing
export const TURBO_FIRE_RATE = 150; // ms

// Visuals
export const LEVEL_COLORS = [
    { from: '#4a3a91', to: '#1e293b' }, // Night
    { from: '#0ea5e9', to: '#22d3ee' }, // Day
    { from: '#f97316', to: '#ea580c' }, // Sunset
    { from: '#6d28d9', to: '#312e81' }, // Dusk
    { from: '#be185d', to: '#831843' }, // Crimson
];
