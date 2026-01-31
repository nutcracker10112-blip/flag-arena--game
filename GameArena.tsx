import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Country, FlagState, EliminatedFlagState } from '../types';
import { GAME_SETTINGS } from '../constants';
import Flag from './Flag';

interface GameArenaProps {
  countries: Country[];
  onGameOver: (winner: Country) => void;
  isPlaying: boolean;
  initialSpeed: number;
  eliminatorSpeed: number;
  isSoundEnabled: boolean;
  collisionVolume: number;
}

const GameArena: React.FC<GameArenaProps> = ({ countries, onGameOver, isPlaying, initialSpeed, eliminatorSpeed, isSoundEnabled, collisionVolume }) => {
  const [flags, setFlags] = useState<FlagState[]>([]);
  const [fallingFlags, setFallingFlags] = useState<EliminatedFlagState[]>([]);
  
  const flagsRef = useRef<FlagState[]>([]);
  const fallingFlagsRef = useRef<EliminatedFlagState[]>([]);
  const eliminatorAngleRef = useRef<number>(0);
  const mainLoopIdRef = useRef<number>(0);
  const fallingLoopIdRef = useRef<number>(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const [groundLevel, setGroundLevel] = useState(window.innerHeight);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const updateGroundLevel = useCallback(() => {
    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      setGroundLevel(window.innerHeight - rect.top);
    }
  }, []);

  useEffect(() => {
    updateGroundLevel();
    window.addEventListener('resize', updateGroundLevel);
    const resizeObserver = new ResizeObserver(updateGroundLevel);
    if (document.body) resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('resize', updateGroundLevel);
      resizeObserver.disconnect();
    };
  }, [updateGroundLevel]);

  const playPopSound = useCallback(() => {
    if (!isSoundEnabled || !audioCtxRef.current || collisionVolume <= 0) return;
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    // Tactile wood clack: Triangle wave with sharp pitch drop and fast decay
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(700 + Math.random() * 200, now);
    oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.025);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(collisionVolume * 0.5, now + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03); 

    oscillator.start(now);
    oscillator.stop(now + 0.04);
  }, [isSoundEnabled, collisionVolume]);

  const initializeFlags = useCallback(() => {
    const { ARENA_SIZE } = GAME_SETTINGS;
    const radius = ARENA_SIZE / 2;

    const initialFlags = countries.map(country => {
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * (radius * 0.6);
      const x = radius + dist * Math.cos(angle);
      const y = radius + dist * Math.sin(angle);
      const velocityAngle = Math.random() * 2 * Math.PI;
      return { 
        id: country.code, 
        country, 
        x, 
        y, 
        vx: Math.cos(velocityAngle) * initialSpeed, 
        vy: Math.sin(velocityAngle) * initialSpeed 
      };
    });
    flagsRef.current = initialFlags;
    setFlags(initialFlags);
    fallingFlagsRef.current = [];
    setFallingFlags([]);
  }, [countries, initialSpeed]);

  useEffect(() => {
    initializeFlags();
  }, [initializeFlags]);

  const animateFallingFlags = useCallback(() => {
    const currentFalling = fallingFlagsRef.current;
    if (currentFalling.length === 0 && !isPlaying) {
      fallingLoopIdRef.current = requestAnimationFrame(animateFallingFlags);
      return;
    }

    const rect = arenaRef.current?.getBoundingClientRect();
    const minX = rect ? -rect.left : -1000;
    const maxX = rect ? window.innerWidth - rect.left - GAME_SETTINGS.FLAG_WIDTH : 1000;

    const nextFalling = currentFalling.map(flag => {
      const hash = flag.country.code.charCodeAt(0) + flag.country.code.charCodeAt(1);
      const individualGround = groundLevel - 15 - (hash % 40); 
      
      if (flag.y >= individualGround) {
        return { ...flag, y: individualGround, fallSpeedY: 0, vx: 0, rotationSpeed: 0 };
      }

      const nextFallSpeedY = flag.fallSpeedY + 0.35;
      let nextX = flag.x + flag.vx;
      let nextVx = flag.vx;

      if (nextX < minX) {
        nextX = minX;
        nextVx = Math.abs(nextVx) * 0.5;
      } else if (nextX > maxX) {
        nextX = maxX;
        nextVx = -Math.abs(nextVx) * 0.5;
      }

      return {
        ...flag,
        x: nextX,
        vx: nextVx,
        y: flag.y + nextFallSpeedY,
        fallSpeedY: nextFallSpeedY,
        rotation: flag.rotation + flag.rotationSpeed,
      };
    });

    fallingFlagsRef.current = nextFalling;
    setFallingFlags(nextFalling);
    fallingLoopIdRef.current = requestAnimationFrame(animateFallingFlags);
  }, [groundLevel, isPlaying]);

  useEffect(() => {
    fallingLoopIdRef.current = requestAnimationFrame(animateFallingFlags);
    return () => cancelAnimationFrame(fallingLoopIdRef.current);
  }, [animateFallingFlags]);

  const gameLoop = useCallback(() => {
    if (!isPlaying) return;

    const { ARENA_SIZE, FLAG_WIDTH, ELIMINATOR_GAP_SIZE, ELIMINATOR_RADIUS_RATIO, COLLISION_BOOST, MIN_SPEED } = GAME_SETTINGS;
    const radius = ARENA_SIZE / 2;
    const flagRadius = FLAG_WIDTH / 2;

    eliminatorAngleRef.current = (eliminatorAngleRef.current + eliminatorSpeed) % 360;
    
    let currentFlags = flagsRef.current.map(f => ({...f}));
    currentFlags.forEach(flag => {
      flag.x += flag.vx;
      flag.y += flag.vy;
    });

    for (let i = 0; i < currentFlags.length; i++) {
      for (let j = i + 1; j < currentFlags.length; j++) {
        const flagA = currentFlags[i];
        const flagB = currentFlags[j];
        const dx = flagB.x - flagA.x;
        const dy = flagB.y - flagA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < FLAG_WIDTH) {
          playPopSound();
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = (FLAG_WIDTH - distance) / 2;
          flagA.x -= overlap * nx;
          flagA.y -= overlap * ny;
          flagB.x += overlap * nx;
          flagB.y += overlap * ny;

          const dotA = flagA.vx * nx + flagA.vy * ny;
          const dotB = flagB.vx * nx + flagB.vy * ny;
          
          const vax = flagA.vx - dotA * nx + dotB * nx;
          const vay = flagA.vy - dotA * ny + dotB * ny;
          const vbx = flagB.vx - dotB * nx + dotA * nx;
          const vby = flagB.vy - dotB * ny + dotA * ny;

          flagA.vx = vax * COLLISION_BOOST;
          flagA.vy = vay * COLLISION_BOOST;
          flagB.vx = vbx * COLLISION_BOOST;
          flagB.vy = vby * COLLISION_BOOST;
        }
      }
    }

    const eliminatorRadius = radius * ELIMINATOR_RADIUS_RATIO;
    const eliminatorStartAngle = eliminatorAngleRef.current;
    const eliminatorEndAngle = (eliminatorAngleRef.current + ELIMINATOR_GAP_SIZE) % 360;

    const survivingFlags: FlagState[] = [];
    const newlyEliminated: FlagState[] = [];

    for (const flag of currentFlags) {
      const distFromCenter = Math.sqrt((flag.x - radius) ** 2 + (flag.y - radius) ** 2);
      const isTouchingRing = distFromCenter + flagRadius > eliminatorRadius;

      if (distFromCenter - flagRadius > eliminatorRadius) {
        newlyEliminated.push(flag);
        continue;
      }

      if (isTouchingRing) {
        let angleDegrees = (Math.atan2(flag.y - radius, flag.x - radius) * 180) / Math.PI;
        if (angleDegrees < 0) angleDegrees += 360;

        let isInGap = false;
        if (eliminatorStartAngle < eliminatorEndAngle) {
          if (angleDegrees > eliminatorStartAngle && angleDegrees < eliminatorEndAngle) isInGap = true;
        } else {
          if (angleDegrees > eliminatorStartAngle || angleDegrees < eliminatorEndAngle) isInGap = true;
        }

        if (isInGap) {
          if (distFromCenter > eliminatorRadius - flagRadius) {
            newlyEliminated.push(flag);
            continue;
          }
        } else {
          const dotProduct = flag.vx * (flag.x - radius) + flag.vy * (flag.y - radius);
          if (dotProduct > 0) {
            playPopSound();
            const normalX = (flag.x - radius) / distFromCenter;
            const normalY = (flag.y - radius) / distFromCenter;
            const reflectDot = flag.vx * normalX + flag.vy * normalY;
            flag.vx = (flag.vx - 2 * reflectDot * normalX) * COLLISION_BOOST;
            flag.vy = (flag.vy - 2 * reflectDot * normalY) * COLLISION_BOOST;
            const repositionRadius = eliminatorRadius - flagRadius;
            flag.x = radius + repositionRadius * normalX;
            flag.y = radius + repositionRadius * normalY;
          }
        }
      }
      
      const speed = Math.sqrt(flag.vx * flag.vx + flag.vy * flag.vy);
      if (speed > 0 && speed < MIN_SPEED) {
        flag.vx *= (MIN_SPEED / speed);
        flag.vy *= (MIN_SPEED / speed);
      }
      survivingFlags.push(flag);
    }
    
    if (newlyEliminated.length > 0) {
      const newFalling = newlyEliminated.map(f => ({
        ...f,
        fallSpeedY: Math.abs(f.vy) * 0.6 + 1.5,
        vx: f.vx * 0.8,
        scale: 1,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
      }));
      fallingFlagsRef.current = [...fallingFlagsRef.current, ...newFalling];
    }
    
    flagsRef.current = survivingFlags;
    setFlags(survivingFlags);
    
    if (survivingFlags.length <= 1) {
      if (survivingFlags.length === 1) onGameOver(survivingFlags[0].country);
      return; 
    }
    mainLoopIdRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, onGameOver, eliminatorSpeed, playPopSound]);

  useEffect(() => {
    if (isPlaying) {
      mainLoopIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(mainLoopIdRef.current);
    }
    return () => cancelAnimationFrame(mainLoopIdRef.current);
  }, [isPlaying, gameLoop]);
  
  const { ARENA_SIZE, ELIMINATOR_RADIUS_RATIO, ELIMINATOR_THICKNESS, ELIMINATOR_GAP_SIZE, FLAG_WIDTH, FLAG_HEIGHT } = GAME_SETTINGS;
  const eliminatorSize = ARENA_SIZE * ELIMINATOR_RADIUS_RATIO;
  const eliminatorRadius = (eliminatorSize - ELIMINATOR_THICKNESS) / 2;
  const circumference = 2 * Math.PI * eliminatorRadius;
  const gapLength = (ELIMINATOR_GAP_SIZE / 360) * circumference;
  const solidLength = circumference - gapLength;

  return (
    <div ref={arenaRef} className="relative" style={{ width: ARENA_SIZE, height: ARENA_SIZE }}>
      <div
        className="absolute"
        style={{
          width: eliminatorSize,
          height: eliminatorSize,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${eliminatorAngleRef.current}deg)`,
          zIndex: 5
        }}
      >
        <svg className="w-full h-full" viewBox={`0 0 ${eliminatorSize} ${eliminatorSize}`}>
          <circle
            cx={eliminatorSize / 2}
            cy={eliminatorSize / 2}
            r={eliminatorRadius}
            fill="none"
            stroke="#075985"
            strokeWidth={ELIMINATOR_THICKNESS}
            strokeDasharray={`${solidLength} ${gapLength}`}
            strokeDashoffset={-gapLength}
            strokeLinecap="butt"
          />
        </svg>
      </div>

      {fallingFlags.map(flag => (
        <div
          key={flag.id + '-falling'}
          className="absolute"
          style={{
            width: `${FLAG_WIDTH}px`,
            height: `${FLAG_HEIGHT}px`,
            left: `0px`,
            top: `0px`,
            transform: `translate(${flag.x - FLAG_WIDTH/2}px, ${flag.y - FLAG_HEIGHT/2}px) rotate(${flag.rotation}deg)`,
            opacity: flag.opacity,
            zIndex: flag.fallSpeedY === 0 ? 0 : 2,
            willChange: 'transform',
          }}
        >
          <img
            src={`https://flagcdn.com/w40/${flag.country.code}.png`}
            alt={flag.country.name}
            className="w-full h-full object-cover rounded-sm shadow-sm"
            draggable="false"
          />
        </div>
      ))}

      {flags.map(flag => (
        <Flag key={flag.id} country={flag.country} x={flag.x} y={flag.y} />
      ))}
    </div>
  );
};

export default GameArena;