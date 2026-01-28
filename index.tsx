import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calculator, 
  CheckSquare, 
  Clock, 
  Gamepad2, 
  X, 
  Minus, 
  Square, 
  Battery, 
  Wifi, 
  Volume2, 
  Search, 
  LayoutGrid,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Plus,
  Settings,
  FileText,
  Palette,
  Terminal as TerminalIcon,
  LogOut,
  Power,
  User,
  ArrowRight,
  Lock,
  Maximize2,
  Smartphone,
  ChevronRight,
  Moon,
  Sun,
  Bluetooth
} from 'lucide-react';
import { AppId, AppConfig, WindowState } from './types';

// --- SOUND MANAGER ---
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playSound = (type: 'click' | 'startup' | 'login' | 'logout' | 'error') => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.connect(gain);

  switch (type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;
    case 'startup':
      const notes = [261.63, 329.63, 392.00, 523.25]; 
      notes.forEach((freq, i) => {
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.15);
        g.gain.linearRampToValueAtTime(0.1, t + i * 0.15 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 1.5);
        o.start(t + i * 0.15);
        o.stop(t + i * 0.15 + 1.5);
      });
      break;
    case 'login':
      [523.25, 659.25].forEach((freq, i) => {
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
        o.start(t + i * 0.1);
        o.stop(t + i * 0.1 + 0.5);
      });
      break;
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
      break;
  }
};

// --- WALLPAPER CONTEXT ---
const WallpaperContext = createContext<{
  wallpaper: string;
  setWallpaper: (url: string) => void;
}>({ wallpaper: '', setWallpaper: () => {} });

// --- APPS ---

// 1. Calculator
const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handlePress = (val: string) => {
    playSound('click');
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(equation + display); 
        setDisplay(String(res));
        setEquation('');
      } catch {
        setDisplay('Error');
        playSound('error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(equation + display + val);
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  const btns = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'];

  return (
    <div className="h-full flex flex-col bg-[#202020] text-white p-1">
      <div className="bg-transparent p-4 mb-2 text-right font-sans text-4xl font-light h-20 flex items-center justify-end overflow-hidden">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1 flex-1">
        {btns.map(b => (
          <button 
            key={b} 
            onClick={() => handlePress(b)}
            className={`rounded-md font-medium text-lg hover:bg-white/10 active:bg-white/20 transition-colors ${b === 'C' ? 'col-span-4 bg-red-500/80 hover:bg-red-500' : 'bg-[#2d2d2d]'}`}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
};

// 2. Todo
const TodoApp = () => {
  const [todos, setTodos] = useState<{id: string, text: string, done: boolean}[]>([]);
  const [input, setInput] = useState('');

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: input, done: false }]);
    setInput('');
    playSound('click');
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f3f3] text-gray-900 p-6">
      <h2 className="text-2xl font-semibold mb-6">My Day</h2>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <div className="flex-1 bg-white rounded-lg shadow-sm flex items-center px-3 py-2 border border-transparent focus-within:border-blue-500 transition-colors">
            <Plus size={20} className="text-gray-400 mr-2" />
            <input 
              className="flex-1 outline-none bg-transparent"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a task"
            />
        </div>
      </form>
      <div className="flex-1 overflow-y-auto space-y-1">
        {todos.map(t => (
          <div key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm group hover:shadow-md transition-shadow">
            <button onClick={() => {
              setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x));
              playSound('click');
            }}>
              {t.done ? <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><CheckSquare size={14} className="text-white"/></div> : <div className="w-5 h-5 border-2 border-gray-400 rounded-full"/>}
            </button>
            <span className={`flex-1 ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.text}</span>
            <button onClick={() => setTodos(todos.filter(x => x.id !== t.id))} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Snake Game
const SnakeApp = () => {
  const CANVAS_SIZE = 400; 
  const GRID_SIZE = 20;
  const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;
  
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const snakeRef = useRef([[10, 10]]);
  const foodRef = useRef([15, 15]);
  const isPlayingRef = useRef(false);
  const gameOverRef = useRef(false);
  const moveQueue = useRef<number[][]>([]);
  const currentDir = useRef([1, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const resetGame = () => {
    const startSnake = [[10, 10]];
    const startFood = [Math.floor(Math.random() * CELL_COUNT), Math.floor(Math.random() * CELL_COUNT)];
    setSnake(startSnake);
    setFood(startFood);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    snakeRef.current = startSnake;
    foodRef.current = startFood;
    isPlayingRef.current = true;
    gameOverRef.current = false;
    currentDir.current = [1, 0];
    moveQueue.current = [];
    playSound('startup');
  };

  const handleControl = (dx: number, dy: number) => {
    if (gameOverRef.current) return;
    const lastMove = moveQueue.current.length > 0 ? moveQueue.current[moveQueue.current.length - 1] : currentDir.current;
    if (dx === -lastMove[0] && dy === -lastMove[1]) return;
    if (dx === lastMove[0] && dy === lastMove[1]) return;
    moveQueue.current.push([dx, dy]);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) return;
      switch(e.key) {
        case 'ArrowUp': handleControl(0, -1); break;
        case 'ArrowDown': handleControl(0, 1); break;
        case 'ArrowLeft': handleControl(-1, 0); break;
        case 'ArrowRight': handleControl(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const gameLoop = (time: number) => {
    if (!isPlayingRef.current || gameOverRef.current) return;
    if (time - lastTimeRef.current < 80) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = time;

    if (moveQueue.current.length > 0) currentDir.current = moveQueue.current.shift()!;
    const dir = currentDir.current;
    const oldHead = snakeRef.current[0];
    const newHead = [oldHead[0] + dir[0], oldHead[1] + dir[1]];
    
    if (newHead[0] < 0 || newHead[0] >= CELL_COUNT || newHead[1] < 0 || newHead[1] >= CELL_COUNT || 
        snakeRef.current.some(seg => seg[0] === newHead[0] && seg[1] === newHead[1])) {
      setGameOver(true);
      gameOverRef.current = true;
      setIsPlaying(false);
      isPlayingRef.current = false;
      playSound('error');
      return;
    }

    const newSnake = [newHead, ...snakeRef.current];
    if (newHead[0] === foodRef.current[0] && newHead[1] === foodRef.current[1]) {
      setScore(s => s + 1);
      let nextFood;
      do {
        nextFood = [Math.floor(Math.random() * CELL_COUNT), Math.floor(Math.random() * CELL_COUNT)];
      } while (newSnake.some(s => s[0] === nextFood![0] && s[1] === nextFood![1]));
      setFood(nextFood);
      foodRef.current = nextFood;
      playSound('click');
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
    snakeRef.current = newSnake;
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying && !gameOver) requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw Snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
      ctx.fillRect(seg[0] * GRID_SIZE + 1, seg[1] * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(food[0] * GRID_SIZE + GRID_SIZE/2, food[1] * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
    ctx.fill();
  }, [snake, food]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2 outline-none" tabIndex={0}>
      <div className="mb-2 flex justify-between w-full max-w-[300px]">
        <span>Score: {score}</span>
        {gameOver && <span className="text-red-500 font-bold">GAME OVER</span>}
      </div>
      <div className="relative border-2 border-slate-700 rounded overflow-hidden shadow-lg">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-[300px] h-[300px]" />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <button onClick={resetGame} className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">{gameOver ? 'TRY AGAIN' : 'START'}</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div/>
        <button onClick={() => handleControl(0, -1)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Play className="-rotate-90" size={20}/></button>
        <div/>
        <button onClick={() => handleControl(-1, 0)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Play className="rotate-180" size={20}/></button>
        <button onClick={() => handleControl(0, 1)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Play className="rotate-90" size={20}/></button>
        <button onClick={() => handleControl(1, 0)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Play size={20}/></button>
      </div>
    </div>
  );
};

// 4. Timer
const TimerApp = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  
  useEffect(() => {
    let int: number;
    if(running) int = window.setInterval(() => setTime(t => t + 10), 10);
    return () => clearInterval(int);
  }, [running]);

  const format = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    const rms = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}.${rms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
      <div className="text-7xl font-light font-mono mb-12 tabular-nums tracking-wider relative z-10">{format(time)}</div>
      <div className="flex gap-6 relative z-10">
        <button onClick={() => { setRunning(!running); playSound('click'); }} className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${running ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {running ? <Pause fill="currentColor" size={24}/> : <Play fill="currentColor" size={24}/>}
        </button>
        <button onClick={() => { setRunning(false); setTime(0); playSound('click'); }} className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 transition-transform hover:scale-105 active:scale-95">
          <RotateCcw size={24}/>
        </button>
      </div>
    </div>
  );
};

// 5. Notepad
const NotepadApp = () => {
  const [text, setText] = useState('Welcome to AnshOS!');
  return (
    <textarea 
      className="w-full h-full resize-none p-6 bg-white text-gray-800 font-sans outline-none leading-relaxed text-lg"
      value={text}
      onChange={e => setText(e.target.value)}
      placeholder="Type something..."
    />
  );
};

// 6. Settings
const SettingsApp = () => {
  const { wallpaper, setWallpaper } = useContext(WallpaperContext);
  // Updated wallpapers
  const wallpapers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Blue Abstract (Win 11 like)
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop', // Gradient
    'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop', // Mountains
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Space
  ];

  return (
    <div className="h-full flex bg-[#f0f4f9] text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white/50 backdrop-blur-xl p-4 flex flex-col gap-1 border-r border-gray-200">
          <div className="p-3 mb-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">G</div>
             <div>
                <div className="text-sm font-semibold">Guest User</div>
                <div className="text-xs text-gray-500">Local Account</div>
             </div>
          </div>
          {['System', 'Bluetooth & devices', 'Network & internet', 'Personalization', 'Apps', 'Accounts'].map((item, i) => (
             <button key={item} className={`text-left px-4 py-2 rounded-md text-sm transition-colors ${i === 3 ? 'bg-white shadow-sm font-medium text-blue-600' : 'hover:bg-gray-200/50 text-gray-600'}`}>
                {item}
             </button>
          ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6">Personalization</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="block mb-4 font-medium text-gray-700">Select a theme to apply</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wallpapers.map((url, i) => (
              <button 
                key={i} 
                onClick={() => { setWallpaper(url); playSound('click'); }}
                className={`aspect-video rounded-lg bg-cover bg-center ring-2 ring-offset-2 transition-all ${wallpaper === url ? 'ring-blue-500' : 'ring-transparent hover:ring-gray-300'}`}
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-400 text-center">
          AnshOS 11 Pro <br/>
          Version 22H2 (OS Build 22621.1)
        </div>
      </div>
    </div>
  );
};

// 7. Terminal
const TerminalApp = () => {
  return (
    <div className="h-full bg-[#0c0c0c] text-gray-200 font-mono p-4 text-sm overflow-y-auto">
      <div className="mb-2 text-yellow-400">root@anshos:~$ <span className="text-gray-200">neofetch</span></div>
      <pre className="mb-4 text-blue-400 font-bold leading-snug">
{`       .---.
      /     \\   OS: AnshOS x86_64
      |  O  |   Kernel: 11.0.0-NT
      \\  _  /   Uptime: Just now
       '.__.'   Shell: zsh 5.8
                Theme: Acrylic Dark
`}
      </pre>
      <div className="flex gap-2 items-center">
        <span className="text-green-500">➜</span>
        <span className="text-cyan-400">~</span>
        <span className="animate-pulse bg-gray-500 w-2 h-4 block"></span>
      </div>
    </div>
  );
};

// --- CONFIG ---
const APPS: Record<AppId, AppConfig> = {
  calculator: { id: 'calculator', name: 'Calculator', icon: <Calculator />, component: CalculatorApp, defaultSize: { width: 320, height: 480 } },
  todo: { id: 'todo', name: 'To Do', icon: <CheckSquare />, component: TodoApp, defaultSize: { width: 400, height: 550 } },
  timer: { id: 'timer', name: 'Clock', icon: <Clock />, component: TimerApp, defaultSize: { width: 350, height: 250 } },
  snake: { id: 'snake', name: 'Snake', icon: <Gamepad2 />, component: SnakeApp, defaultSize: { width: 400, height: 500 } },
  notepad: { id: 'notepad', name: 'Notepad', icon: <FileText />, component: NotepadApp, defaultSize: { width: 600, height: 400 } },
  settings: { id: 'settings', name: 'Settings', icon: <Settings />, component: SettingsApp, defaultSize: { width: 900, height: 600 } },
  terminal: { id: 'terminal', name: 'Terminal', icon: <TerminalIcon />, component: TerminalApp, defaultSize: { width: 600, height: 400 } },
  paint: { id: 'paint', name: 'Paint', icon: <Palette />, component: () => <div className="h-full flex items-center justify-center text-gray-500">Paint app coming soon...</div>, defaultSize: { width: 500, height: 400 } },
};

// --- SYSTEM COMPONENTS ---

const AppWindow: React.FC<{ 
  win: WindowState; 
  onClose: (id: string) => void; 
  onMinimize: (id: string) => void; 
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void; 
}> = ({ win, onClose, onMinimize, onMaximize, onFocus }) => {
  const App = APPS[win.appId].component;
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(win.position);
  
  // Sync if window state updates
  useEffect(() => {
    if(!win.isMaximized) setPos(win.position);
  }, [win.position, win.isMaximized]);

  const handlePointerDown = (e: React.PointerEvent) => {
    onFocus(win.id);
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    if(!win.isMaximized) {
      isDragging.current = true;
      dragOffset.current = { 
        x: e.clientX - pos.x, 
        y: e.clientY - pos.y 
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current && !win.isMaximized) {
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (win.isMinimized) return null;

  const style = win.isMaximized ? {
    top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', borderRadius: 0
  } : {
    top: pos.y, left: pos.x, width: win.size.width, height: win.size.height, borderRadius: '0.75rem'
  };

  return (
    <div 
      className="absolute flex flex-col bg-[#f9f9f9] shadow-2xl overflow-hidden border border-gray-400/20 transition-all duration-200"
      style={{ ...style, zIndex: win.zIndex }}
      onPointerDown={() => onFocus(win.id)}
    >
      {/* Title Bar (Windows 11 Style) */}
      <div 
        className="h-10 bg-white flex items-center justify-between px-3 select-none touch-none border-b border-gray-100"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
          <span className="text-gray-500">{APPS[win.appId].icon}</span>
          {win.title}
        </div>
        <div className="flex items-center window-controls h-full">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} className="w-10 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-gray-600"><Minus size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }} className="w-10 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-gray-600">
             {win.isMaximized ? <Square size={12} className="stroke-[2.5]" /> : <Maximize2 size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }} className="w-10 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors text-gray-600"><X size={18} /></button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto relative bg-white">
        <App />
      </div>
    </div>
  );
};

const StartMenu = ({ isOpen, onClose, onLaunch, onLogout }: any) => {
  if (!isOpen) return null;
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[640px] max-w-[95vw] h-[680px] max-h-[75vh] bg-[#1e1e1e]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden text-white font-sans">
      {/* Search Bar */}
      <div className="p-6 pb-2">
        <div className="bg-[#2d2d2d] border-b-2 border-transparent focus-within:border-blue-500 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 shadow-inner">
           <Search size={18} className="text-gray-400" />
           <input type="text" placeholder="Search for apps, settings, and documents" className="bg-transparent outline-none flex-1 placeholder-gray-500" autoFocus />
        </div>
      </div>

      {/* Pinned Section */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-hide">
        <div className="flex justify-between items-center mb-4 px-4">
           <span className="text-sm font-semibold tracking-wide">Pinned</span>
           <button className="bg-white/5 px-3 py-1 rounded-md text-xs hover:bg-white/10 transition-colors flex items-center gap-1">All apps <ChevronRight size={12}/></button>
        </div>
        <div className="grid grid-cols-6 gap-y-6 gap-x-2">
           {Object.values(APPS).map(app => (
             <button key={app.id} onClick={() => { onLaunch(app.id); onClose(); }} className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition active:scale-95 group">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/20 transition-all">
                   {/* Colored Icons for more realism */}
                   {React.cloneElement(app.icon as React.ReactElement, { 
                     size: 28, 
                     className: app.id === 'settings' ? 'text-gray-400' : 
                                app.id === 'todo' ? 'text-blue-400' : 
                                app.id === 'calculator' ? 'text-green-400' :
                                app.id === 'snake' ? 'text-purple-400' : 
                                app.id === 'timer' ? 'text-red-400' : 'text-white' 
                   })}
                </div>
                <span className="text-[11px] font-medium text-center text-gray-200">{app.name}</span>
             </button>
           ))}
        </div>

        {/* Recommended Section (Mock) */}
        <div className="mt-8 px-4">
           <span className="text-sm font-semibold mb-4 block tracking-wide">Recommended</span>
           <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                 <FileText className="text-blue-400" size={24}/>
                 <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-200 group-hover:text-white">Project_Proposal.docx</span>
                    <span className="text-[10px] text-gray-400">10m ago</span>
                 </div>
              </div>
               <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                 <Settings className="text-gray-400" size={24}/>
                 <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-200 group-hover:text-white">System Settings</span>
                    <span className="text-[10px] text-gray-400">Yesterday at 4:20 PM</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-16 bg-[#171717] px-8 flex items-center justify-between border-t border-white/5">
         <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg cursor-pointer transition">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">GU</div>
             <span className="text-xs font-medium text-gray-300">Guest User</span>
         </div>
         <button onClick={onLogout} className="p-3 hover:bg-white/10 rounded-lg transition hover:text-red-400">
            <Power size={18} />
         </button>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, isShuttingDown }: { onLogin: () => void, isShuttingDown: boolean }) => {
  const [pass, setPass] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  // Clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div 
      className={`absolute inset-0 z-[10000] bg-cover bg-center flex flex-col items-center justify-center transition-all duration-1000 ${isShuttingDown ? 'brightness-0' : 'brightness-100'}`}
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="mb-16 text-center text-white drop-shadow-md">
          <div className="text-8xl font-sans font-light mb-4 tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-2xl font-medium tracking-wide">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200/20 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
             <User className="w-16 h-16 text-white/90" />
          </div>
          <h2 className="text-white text-2xl font-semibold tracking-wide">Guest User</h2>
          
          <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-64">
            <div className="w-full relative">
              <input 
                type="password" 
                placeholder="Password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-md px-4 py-2 text-white placeholder-white/40 outline-none focus:bg-black/50 focus:border-white/40 transition text-sm text-center"
                autoFocus
              />
               <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition">
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const Desktop = () => {
  const { wallpaper } = useContext(WallpaperContext);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const launchApp = (appId: AppId) => {
    const app = APPS[appId];
    // Simple logic to bring to front if already open
    const existing = windows.find(w => w.appId === appId);
    if(existing) {
        if(existing.isMinimized) toggleMinimize(existing.id);
        focusWindow(existing.id);
        return;
    }

    const newWindow: WindowState = {
      id: Math.random().toString(36).substr(2, 9),
      appId,
      title: app.name,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      position: { x: 100 + (windows.length * 30), y: 50 + (windows.length * 30) },
      size: app.defaultSize || { width: 500, height: 400 }
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    playSound('click');
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    playSound('click');
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    playSound('click');
  };

  const toggleMaximize = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    playSound('click');
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    setActiveWindowId(id);
  };

  const handleLogin = () => {
    playSound('login');
    playSound('startup');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    playSound('logout');
    setIsShuttingDown(true);
    setTimeout(() => {
      setWindows([]);
      setIsLoggedIn(false);
      setIsShuttingDown(false);
      setIsStartOpen(false);
    }, 2000);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} isShuttingDown={isShuttingDown} />;
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-cover bg-center select-none font-sans"
      style={{ backgroundImage: `url(${wallpaper || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'})` }}
      onClick={() => setIsStartOpen(false)}
    >
      {/* Desktop Icons (Left Aligned vertical grid) */}
      <div className="absolute top-4 left-4 flex flex-col flex-wrap gap-2 h-[calc(100%-60px)] content-start">
        {Object.values(APPS).slice(0, 5).map(app => (
          <button 
            key={app.id} 
            onClick={(e) => { e.stopPropagation(); launchApp(app.id); }}
            className="w-24 flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 text-white group transition border border-transparent hover:border-white/10"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl shadow-lg group-hover:bg-white/20 transition flex items-center justify-center backdrop-blur-sm">
              {React.cloneElement(app.icon as React.ReactElement, { size: 28 })}
            </div>
            <span className="text-xs font-medium drop-shadow-md text-center line-clamp-2 leading-tight text-white/90">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {windows.map(win => (
        <AppWindow 
          key={win.id} 
          win={win} 
          onClose={closeWindow} 
          onMinimize={toggleMinimize} 
          onMaximize={toggleMaximize}
          onFocus={focusWindow}
        />
      ))}

      {/* Start Menu */}
      <div onClick={e => e.stopPropagation()}>
        <StartMenu 
          isOpen={isStartOpen} 
          onClose={() => setIsStartOpen(false)} 
          onLaunch={launchApp} 
          onLogout={handleLogout}
        />
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1f1f1f]/85 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-2 z-[99999]">
        
        {/* Center Icons */}
        <div className="flex items-center gap-1.5 h-full">
            {/* Start Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsStartOpen(!isStartOpen); playSound('click'); }}
                className="p-2.5 hover:bg-white/10 rounded-md transition active:scale-90 group relative"
            >
                <div className="absolute inset-0 bg-blue-500/20 rounded-md filter blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <LayoutGrid className="text-blue-400 relative z-10" fill="currentColor" size={24} />
            </button>

             {/* Search */}
             <button className="p-2.5 hover:bg-white/10 rounded-md transition active:scale-95 hidden md:block">
                <Search size={24} className="text-gray-300" />
            </button>

            {/* Running Apps */}
            {windows.map(win => (
                <button
                    key={win.id}
                    onClick={() => win.isMinimized ? focusWindow(win.id) : toggleMinimize(win.id)}
                    className="relative p-2.5 w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition group"
                >
                     <div className="text-white/90 drop-shadow">{APPS[win.appId].icon}</div>
                     {/* Active Indicator */}
                    <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full transition-all ${!win.isMinimized && activeWindowId === win.id ? 'bg-blue-400 w-4' : 'bg-gray-400 opacity-50'}`} />
                </button>
            ))}
        </div>

        {/* System Tray (Right) */}
        <div className="absolute right-2 flex items-center gap-2 h-full">
            <button className="hidden sm:block p-1 hover:bg-white/10 rounded-md">
                 <div className="text-[10px] text-white/80">ENG</div>
            </button>
            <div className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-md px-2 transition h-9 cursor-default">
                <Wifi size={18} />
                <Volume2 size={18} />
                <Battery size={18} />
            </div>
            <div className="flex flex-col items-end justify-center hover:bg-white/10 p-1 rounded-md px-2 transition h-9 cursor-default min-w-[70px]">
                <div className="text-xs font-medium leading-none mb-0.5">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</div>
                <div className="text-[10px] opacity-70 leading-none">{currentTime.toLocaleDateString()}</div>
            </div>
            {/* Show Desktop Nook */}
            <div className="w-1.5 h-full border-l border-white/10 ml-1 hover:bg-white/10"></div>
        </div>
      </div>
    </div>
  );
};

// --- ORIENTATION LOCK ---
const OrientationLock = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100000] text-center p-6">
      <div className="relative mb-8">
        <div className="w-16 h-24 border-2 border-gray-600 rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90" />
        <div className="w-16 h-24 border-2 border-white rounded-lg animate-pulse" />
        <RotateCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} size={32}/>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Rotate Device</h2>
      <p className="text-gray-400">Please rotate your device to landscape mode to access AnshOS.</p>
    </div>
  );
};

// --- ROOT ---
const App = () => {
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (isPortrait) return <OrientationLock />;

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      <Desktop />
    </WallpaperContext.Provider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);