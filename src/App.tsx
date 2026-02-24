/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Using Three.js from CDN as requested
const THREE_CDN = 'https://unpkg.com/three@0.160.0/build/three.module.js';

export default function App() {
  const [age, setAge] = useState<number>(25);
  const [started, setStarted] = useState(false);
  const [isBlown, setIsBlown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  const startExperience = () => {
    if (age > 0) {
      setStarted(true);
    }
  };

  useEffect(() => {
    if (!started || !containerRef.current) return;

    let THREE: any;
    let scene: any, camera: any, renderer: any;
    let stars: any, cake: any = [], candles: any = [], flames: any = [], lights: any = [];
    let fireworks: any = [];
    let mouse = { x: 0, y: 0 };
    let audioContext: AudioContext, analyser: AnalyserNode, dataArray: Uint8Array;
    let animationFrameId: number;

    const init = async () => {
      // Import Three.js dynamically from CDN
      const module = await import(/* @vite-ignore */ THREE_CDN);
      THREE = module;

      // Scene Setup
      scene = new THREE.Scene();
      sceneRef.current = scene;
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 5, 15);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.useLegacyLights = false; // Physically correct lighting
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      containerRef.current?.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 3);
      mainLight.position.set(5, 10, 7);
      scene.add(mainLight);

      // Space Background
      createGalaxy();

      // Build Cake
      buildCake();

      // Audio Setup for Blow Detection
      setupAudio();

      // Event Listeners
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('mousemove', onMouseMove);

      animate();
    };

    const createGalaxy = () => {
      const starCount = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      const colorPalette = [
        new THREE.Color(0x4444ff), // Blue
        new THREE.Color(0xaa00ff), // Purple
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x00ffff), // Cyan
      ];

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      stars = new THREE.Points(geometry, material);
      scene.add(stars);
    };

    const buildCake = () => {
      const cakeGroup = new THREE.Group();
      scene.add(cakeGroup);

      const layers = [
        { radius: 4, height: 2, color: 0x4b2e1e, y: -1 }, // Bottom chocolate
        { radius: 3.5, height: 1.8, color: 0xffd1dc, y: 1 }, // Middle pink
        { radius: 3, height: 1.5, color: 0xffffff, y: 2.8 }, // Top vanilla
      ];

      layers.forEach((layer, index) => {
        const geometry = new THREE.CylinderGeometry(layer.radius, layer.radius, layer.height, 32);
        const material = new THREE.MeshStandardMaterial({ color: layer.color, roughness: 0.7 });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Frosting layer
        const frostingGeo = new THREE.CylinderGeometry(layer.radius + 0.1, layer.radius + 0.1, 0.3, 32);
        const frostingMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const frosting = new THREE.Mesh(frostingGeo, frostingMat);
        frosting.position.y = layer.height / 2;
        mesh.add(frosting);

        mesh.position.y = 20 + index * 5; // Start high for drop animation
        cakeGroup.add(mesh);
        cake.push({ mesh, targetY: layer.y, delay: index * 0.2, velocity: 0 });
      });

      // Candles
      const candleCount = Math.min(age, 30);
      const radius = 2.2;
      for (let i = 0; i < candleCount; i++) {
        const angle = (i / candleCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const candleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
        const candleMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const candle = new THREE.Mesh(candleGeo, candleMat);
        candle.position.set(x, 25, z); // Start high
        cakeGroup.add(candle);

        // Flame
        const flameGeo = new THREE.ConeGeometry(0.12, 0.3, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 0.65;
        candle.add(flame);

        const flameLight = new THREE.PointLight(0xffaa00, 1, 5);
        flameLight.position.y = 0.65;
        candle.add(flameLight);

        candles.push({ mesh: candle, targetY: 3.8, delay: 1 + i * 0.05, velocity: 0 });
        flames.push(flame);
        lights.push(flameLight);
      }
    };

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (err) {
        console.error("Microphone access denied", err);
      }
    };

    const detectBlow = () => {
      if (!analyser || isBlown) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const volume = average / 255;

      if (volume > 0.15) { // Threshold for blow
        handleBlow();
      }
    };

    const handleBlow = () => {
      setIsBlown(true);
      
      // Camera effect
      const targetZ = camera.position.z - 3;
      const shakeIntensity = 0.1;

      // Launch fireworks
      for (let i = 0; i < 8; i++) {
        setTimeout(createFirework, i * 300);
      }
    };

    const createFirework = () => {
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
      
      const geo = new THREE.SphereGeometry(0.1, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color });
      const rocket = new THREE.Mesh(geo, mat);
      rocket.position.set(x, -10, z);
      scene.add(rocket);

      fireworks.push({
        type: 'rocket',
        mesh: rocket,
        velocity: new THREE.Vector3(0, 0.2 + Math.random() * 0.2, 0),
        targetY: 5 + Math.random() * 10,
        color: color
      });
    };

    const explodeFirework = (pos: any, color: any) => {
      const particleCount = 50;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.SphereGeometry(0.05, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        scene.add(p);

        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.2;

        particles.push({
          mesh: p,
          velocity: new THREE.Vector3(
            Math.cos(angle1) * Math.sin(angle2) * speed,
            Math.sin(angle1) * Math.sin(angle2) * speed,
            Math.cos(angle2) * speed
          ),
          life: 1.0
        });
      }
      fireworks.push({ type: 'explosion', particles });
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      // Camera Parallax & Auto Float
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (5 + mouse.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 2, 0);

      // Stars animation
      if (stars) {
        stars.rotation.y += 0.0005;
        const positions = stars.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.01;
          if (positions[i + 1] < -50) positions[i + 1] = 50;
        }
        stars.geometry.attributes.position.needsUpdate = true;
      }

      // Cake Drop Animation (Custom Bounce)
      cake.forEach((layer: any) => {
        if (layer.delay > 0) {
          layer.delay -= 0.016;
          return;
        }
        if (layer.mesh.position.y > layer.targetY) {
          layer.velocity -= 0.015;
          layer.mesh.position.y += layer.velocity;
        } else {
          layer.mesh.position.y = layer.targetY;
          if (Math.abs(layer.velocity) > 0.05) {
            layer.velocity *= -0.5; // Bounce
            layer.mesh.position.y += 0.1;
          } else {
            layer.velocity = 0;
          }
        }
      });

      // Candles Drop
      candles.forEach((candle: any) => {
        if (candle.delay > 0) {
          candle.delay -= 0.016;
          return;
        }
        if (candle.mesh.position.y > candle.targetY) {
          candle.velocity -= 0.015;
          candle.mesh.position.y += candle.velocity;
        } else {
          candle.mesh.position.y = candle.targetY;
          if (Math.abs(candle.velocity) > 0.05) {
            candle.velocity *= -0.4;
            candle.mesh.position.y += 0.05;
          }
        }
      });

      // Flame Flicker
      if (!isBlown) {
        flames.forEach((flame: any, i: number) => {
          const s = 1 + Math.sin(time * 10 + i) * 0.1;
          flame.scale.set(s, s, s);
          lights[i].intensity = 1 + Math.sin(time * 15 + i) * 0.5;
        });
        detectBlow();
      } else {
        // Blow out effect
        flames.forEach((flame: any, i: number) => {
          if (flame.scale.x > 0) {
            flame.scale.x -= 0.05;
            flame.scale.y -= 0.05;
            flame.scale.z -= 0.05;
            lights[i].intensity *= 0.8;
            
            // Tiny glow particles dissolve upward
            if (Math.random() > 0.8) {
              const pGeo = new THREE.SphereGeometry(0.02, 4, 4);
              const pMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
              const p = new THREE.Mesh(pGeo, pMat);
              p.position.copy(flame.getWorldPosition(new THREE.Vector3()));
              scene.add(p);
              fireworks.push({ type: 'smoke', mesh: p, velocity: new THREE.Vector3((Math.random()-0.5)*0.02, 0.05, (Math.random()-0.5)*0.02), life: 1.0 });
            }
          } else {
            flame.visible = false;
            lights[i].visible = false;
          }
        });

        // Camera dolly forward
        camera.position.z -= (camera.position.z - 10) * 0.02;
      }

      // Fireworks logic
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        if (fw.type === 'rocket') {
          fw.mesh.position.add(fw.velocity);
          if (fw.mesh.position.y >= fw.targetY) {
            explodeFirework(fw.mesh.position, fw.color);
            scene.remove(fw.mesh);
            fireworks.splice(i, 1);
          }
        } else if (fw.type === 'explosion') {
          let allDead = true;
          fw.particles.forEach((p: any) => {
            p.mesh.position.add(p.velocity);
            p.velocity.y -= 0.002; // Gravity
            p.life -= 0.01;
            p.mesh.material.opacity = p.life;
            if (p.life > 0) allDead = false;
            else scene.remove(p.mesh);
          });
          if (allDead) fireworks.splice(i, 1);
        } else if (fw.type === 'smoke') {
          fw.mesh.position.add(fw.velocity);
          fw.life -= 0.02;
          fw.mesh.material.opacity = fw.life;
          if (fw.life <= 0) {
            scene.remove(fw.mesh);
            fireworks.splice(i, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (renderer) renderer.dispose();
      if (audioContext) audioContext.close();
    };
  }, [started]);

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden font-sans text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2a] to-[#050510] opacity-50 pointer-events-none" />

      {/* Three.js Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI Overlays */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
          >
            <div className="max-w-md w-full p-8 text-center space-y-8">
              <motion.h1 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-5xl font-bold tracking-tighter uppercase italic"
              >
                Cosmic Birthday
              </motion.h1>
              <p className="text-zinc-400 text-sm uppercase tracking-widest">Enter your age to begin the experience</p>
              
              <div className="space-y-4">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-4 text-4xl text-center focus:outline-none focus:border-white transition-colors"
                  placeholder="0"
                />
                <button
                  onClick={startExperience}
                  className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {started && !isBlown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none"
          >
            <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <p className="text-sm uppercase tracking-[0.3em] font-medium animate-pulse">
                Blow into your microphone to make a wish
              </p>
            </div>
          </motion.div>
        )}

        {isBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
          >
            <h2 className="text-[15vw] font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              Happy Birthday
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Micro-labels */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-50 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-bold">System Status</span>
        <span className="text-[10px] font-mono">3D_RENDER_ACTIVE</span>
        <span className="text-[10px] font-mono">AUDIO_ANALYSIS_ON</span>
      </div>

      <div className="absolute top-8 right-8 flex flex-col items-end gap-1 opacity-50 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest font-bold">Coordinates</span>
        <span className="text-[10px] font-mono">X: {age} | Y: 360 | Z: ∞</span>
      </div>
    </div>
  );
}
