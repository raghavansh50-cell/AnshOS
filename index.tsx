import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
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
  Terminal
} from 'lucide-react';
import { AppId, AppConfig, WindowState, TodoItem, ThemeContextType } from './types';

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.ts')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// --- UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- CONTEXT ---
const ThemeContext = React.createContext<ThemeContextType>({
  wallpaper: '',
  setWallpaper: () => {},
  taskbarColor: '',
  setTaskbarColor: () => {},
});

// --- APPS ---

// 1. Calculator App
const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNum, setNewNum] = useState(true);

  const handleNum = (num: string) => {
    if (newNum) {
      setDisplay(num);
      setNewNum(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (operation: string) => {
    setOp(operation);
    setPrev(display);
    setNewNum(true);
  };

  const calculate = () => {
    if (!prev || !op) return;
    const current = parseFloat(display);
    const previous = parseFloat(prev);
    let result = 0;
    
    switch (op) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '×': result = previous * current; break;
      case '÷': result = previous / current; break;
    }
    
    setDisplay(result.toString());
    setOp(null);
    setPrev(null);
    setNewNum(true);
  };

  const clear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setNewNum(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      <div className="flex-1 flex items-end justify-end text-5xl mb-4 font-light truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-3 h-3/4">
        {['C', '±', '%', '÷'].map((btn, i) => (
          <button key={i} onClick={() => btn === 'C' ? clear() : btn === '÷' ? handleOp('÷') : null} 
            className={`rounded-full text-xl font-medium transition active:scale-95 flex items-center justify-center
            ${i === 0 ? 'bg-gray-400 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}>
            {btn}
          </button>
        ))}
        {['7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+'].map((btn) => (
          <button key={btn} 
            onClick={() => ['+', '-', '×'].includes(btn) ? handleOp(btn) : handleNum(btn)}
            className={`rounded-full text-2xl font-medium transition active:scale-95 flex items-center justify-center
            ${['+', '-', '×'].includes(btn) ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-800 hover:bg-gray-700'}`}>
            {btn}
          </button>
        ))}
        <button onClick={() => handleNum('0')} className="col-span-2 bg-gray-800 hover:bg-gray-700 rounded-full text-2xl font-medium flex items-center pl-8">0</button>
        <button onClick={() => handleNum('.')} className="bg-gray-800 hover:bg-gray-700 rounded-full text-2xl font-medium flex items-center justify-center">.</button>
        <button onClick={calculate} className="bg-amber-600 hover:bg-amber-500 rounded-full text-2xl font-medium flex items-center justify-center">=</button>
      </div>
    </div>
  );
};

// 2. Task Master (Todo)
const TodoApp = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('anshos-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('anshos-todos', JSON.stringify(todos));
  }, [todos]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: generateId(), text: input, completed: false }]);
    setInput('');
  };

  const toggle = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const remove = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white p-4">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Task Master</h2>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-white/10 border border-white/20 rounded p-2 focus:outline-none focus:border-cyan-500 transition"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded transition">
          <Plus size={24} />
        </button>
      </form>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {todos.length === 0 && <div className="text-white/40 text-center mt-10">No tasks yet. Get productive!</div>}
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 bg-white/5 p-3 rounded group hover:bg-white/10 transition">
            <button 
              onClick={() => toggle(todo.id)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition
              ${todo.completed ? 'bg-cyan-500 border-cyan-500' : 'border-white/40 hover:border-cyan-400'}`}
            >
              {todo.completed && <CheckSquare size={14} className="text-black" />}
            </button>
            <span className={`flex-1 ${todo.completed ? 'line-through text-white/40' : ''}`}>{todo.text}</span>
            <button onClick={() => remove(todo.id)} className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Focus Timer
const TimerApp = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound?
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const toggleMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const progress = ((mode === 'work' ? 25 * 60 : 5 * 60) - timeLeft) / (mode === 'work' ? 25 * 60 : 5 * 60) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => mode !== 'work' && toggleMode()}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${mode === 'work' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => mode !== 'break' && toggleMode()}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${mode === 'break' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
        >
          Break
        </button>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke={mode === 'work' ? '#ec4899' : '#22c55e'} 
            strokeWidth="4" 
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-5xl font-mono font-bold tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button 
          onClick={reset}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};

// 4. Snake Game
const SnakeApp = () => {
  const CANVAS_SIZE = 400; // Virtual size
  const GRID_SIZE = 20;
  const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;
  
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [dir, setDir] = useState([1, 0]); // x, y
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const resetGame = () => {
    setSnake([[10, 10]]);
    setFood([Math.floor(Math.random() * CELL_COUNT), Math.floor(Math.random() * CELL_COUNT)]);
    setDir([1, 0]);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const gameLoop = (time: number) => {
    if (!isPlaying || gameOver) return;
    
    // Control speed (15 FPS)
    if (time - lastTimeRef.current < 100) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = time;

    setSnake(prevSnake => {
      const newHead = [prevSnake[0][0] + dir[0], prevSnake[0][1] + dir[1]];
      
      // Check collision with walls
      if (newHead[0] < 0 || newHead[0] >= CELL_COUNT || newHead[1] < 0 || newHead[1] >= CELL_COUNT) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }
      
      // Check collision with self
      if (prevSnake.some(seg => seg[0] === newHead[0] && seg[1] === newHead[1])) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];
      
      // Eat food
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(s => s + 1);
        setFood([Math.floor(Math.random() * CELL_COUNT), Math.floor(Math.random() * CELL_COUNT)]);
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, gameOver, dir, food]); // Dependencies that might restart loop

  // Drawing
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(food[0] * GRID_SIZE + GRID_SIZE/2, food[1] * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    ctx.fillStyle = '#22c55e';
    snake.forEach((seg, i) => {
      ctx.fillRect(seg[0] * GRID_SIZE + 1, seg[1] * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

  }, [snake, food]);

  const handleControl = (dx: number, dy: number) => {
    if ((dx !== 0 && dir[0] === 0) || (dy !== 0 && dir[1] === 0)) {
        setDir([dx, dy]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-4">
      <div className="mb-2 flex justify-between w-full max-w-[300px] text-white font-mono">
        <span>SCORE: {score}</span>
        {gameOver && <span className="text-red-500 font-bold">GAME OVER</span>}
      </div>
      
      <div className="relative border-2 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-[300px] h-[300px] object-contain" />
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <button onClick={resetGame} className="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-green-400">START GAME</button>
          </div>
        )}
        {gameOver && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60">
           <button onClick={resetGame} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200">TRY AGAIN</button>
         </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div />
        <button onClick={() => handleControl(0, -1)} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center active:bg-white/30"><Play className="-rotate-90 fill-white" size={20}/></button>
        <div />
        <button onClick={() => handleControl(-1, 0)} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center active:bg-white/30"><Play className="rotate-180 fill-white" size={20}/></button>
        <button onClick={() => handleControl(0, 1)} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center active:bg-white/30"><Play className="rotate-90 fill-white" size={20}/></button>
        <button onClick={() => handleControl(1, 0)} className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center active:bg-white/30"><Play className="fill-white" size={20}/></button>
      </div>
    </div>
  );
};

// 5. Notepad App
const NotepadApp = () => {
  const [text, setText] = useState(() => localStorage.getItem('anshos-notepad') || '');

  useEffect(() => {
    localStorage.setItem('anshos-notepad', text);
  }, [text]);

  return (
    <div className="h-full flex flex-col bg-white text-black">
      <div className="bg-gray-100 p-1 border-b flex gap-2 text-xs">
        <button className="px-2 py-1 hover:bg-gray-200 rounded">File</button>
        <button className="px-2 py-1 hover:bg-gray-200 rounded">Edit</button>
        <button className="px-2 py-1 hover:bg-gray-200 rounded">Format</button>
      </div>
      <textarea
        className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder="Type something..."
      />
    </div>
  );
};

// 6. Paint App
const PaintApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle resize - simple approach for now (clears canvas on resize unfortunately, typical for simple canvas apps)
    // To preserve content, we'd need to save/restore image data.
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastPos(currentPos);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="p-2 border-b flex items-center gap-4 bg-gray-200 text-black">
        <div className="flex gap-1">
          {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'].map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border border-gray-400 ${color === c ? 'ring-2 ring-cyan-500' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseInt(e.target.value))} 
          className="w-24"
        />
        <button onClick={clearCanvas} className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-100">Clear</button>
      </div>
      <div className="flex-1 relative overflow-hidden bg-gray-400 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute top-0 left-0 bg-white shadow-lg"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
      </div>
    </div>
  );
};

// 7. Terminal App
const TerminalApp = () => {
  const [history, setHistory] = useState<string[]>(['AnshOS v1.0.0 [Snapshot]', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `user@anshos:~$ ${input}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands: help, clear, about, ls, date, whoami');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'about':
        newHistory.push('AnshOS - A simulated desktop environment in React.');
        break;
      case 'ls':
        newHistory.push('Documents  Downloads  Pictures  Music  Desktop');
        break;
      case 'date':
        newHistory.push(new Date().toString());
        break;
      case 'whoami':
        newHistory.push('guest');
        break;
      default:
        newHistory.push(`Command not found: ${cmd}`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="h-full bg-black text-green-500 font-mono text-sm p-4 overflow-y-auto" onClick={() => document.getElementById('term-input')?.focus()}>
      {history.map((line, i) => (
        <div key={i} className="mb-1">{line}</div>
      ))}
      <form onSubmit={handleCommand} className="flex">
        <span className="mr-2">user@anshos:~$</span>
        <input
          id="term-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-green-500"
          autoComplete="off"
          autoFocus
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
};

// 5. Settings App (Modified to be item 8 in logic but kept here for structure)
const SettingsApp = () => {
  const { wallpaper, setWallpaper, taskbarColor, setTaskbarColor } = useContext(ThemeContext);

  const wallpapers = [
    { name: 'Default Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
    { name: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Neon City', url: 'https://images.unsplash.com/photo-1514525253440-b393452e6178?q=80&w=2074&auto=format&fit=crop' },
    { name: 'Minimal Dark', url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2187&auto=format&fit=crop' },
  ];

  const colors = [
    { name: 'Slate', value: 'bg-slate-900/60' },
    { name: 'Blue', value: 'bg-blue-900/60' },
    { name: 'Purple', value: 'bg-purple-900/60' },
    { name: 'Red', value: 'bg-red-900/60' },
    { name: 'Black', value: 'bg-black/80' },
  ];

  return (
    <div className="h-full bg-slate-800 text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Desktop Wallpaper</h3>
        <div className="grid grid-cols-2 gap-4">
          {wallpapers.map((wp) => (
            <button 
              key={wp.url}
              onClick={() => setWallpaper(wp.url)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${wallpaper === wp.url ? 'border-cyan-400 scale-105 shadow-lg' : 'border-transparent hover:border-white/20'}`}
            >
              <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 w-full bg-black/50 p-1 text-xs text-center truncate backdrop-blur-sm">
                {wp.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Taskbar Color</h3>
        <div className="flex flex-wrap gap-4">
          {colors.map((c) => (
            <div key={c.value} className="flex flex-col items-center gap-2">
              <button
                onClick={() => setTaskbarColor(c.value)}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${taskbarColor === c.value ? 'border-cyan-400 scale-110 shadow-lg' : 'border-white/20 hover:border-white/50'}`}
              >
                <div className={`w-full h-full rounded-full ${c.value} border border-white/10`}></div>
              </button>
              <span className="text-xs text-gray-400">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SYSTEM COMPONENTS ---

const APPS: AppConfig[] = [
  { id: 'calculator', name: 'Calculator', icon: <Calculator />, component: CalculatorApp, defaultSize: { width: 320, height: 480 } },
  { id: 'todo', name: 'Task Master', icon: <CheckSquare />, component: TodoApp, defaultSize: { width: 400, height: 500 } },
  { id: 'timer', name: 'Focus Timer', icon: <Clock />, component: TimerApp, defaultSize: { width: 350, height: 450 } },
  { id: 'notepad', name: 'Notepad', icon: <FileText />, component: NotepadApp, defaultSize: { width: 500, height: 400 } },
  { id: 'paint', name: 'Paint', icon: <Palette />, component: PaintApp, defaultSize: { width: 600, height: 500 } },
  { id: 'terminal', name: 'Terminal', icon: <Terminal />, component: TerminalApp, defaultSize: { width: 500, height: 350 } },
  { id: 'snake', name: 'Snake Game', icon: <Gamepad2 />, component: SnakeApp, defaultSize: { width: 400, height: 600 } },
  { id: 'settings', name: 'Settings', icon: <Settings />, component: SettingsApp, defaultSize: { width: 500, height: 600 } },
];

const WindowFrame: React.FC<{ 
  window: WindowState;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
}> = ({ window: win, onClose, onFocus, onMinimize }) => {
  const [pos, setPos] = useState(win.position);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onFocus(win.id);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const AppComp = APPS.find(a => a.id === win.appId)?.component || (() => <div>Error</div>);

  if (win.isMinimized) return null;

  return (
    <div 
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex
      }}
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl bg-gray-900/90 transition-shadow duration-200 
        ${win.isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      onPointerDown={() => onFocus(win.id)}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-white/5 border-b border-white/10 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-white/80">
          {APPS.find(a => a.id === win.appId)?.icon && React.cloneElement(APPS.find(a => a.id === win.appId)?.icon as any, { size: 14 })}
          <span>{win.title}</span>
        </div>
        <div className="flex items-center gap-2" onPointerDown={e => e.stopPropagation()}>
          <button onClick={() => onMinimize(win.id)} className="p-1 hover:bg-white/10 rounded"><Minus size={14} /></button>
          <button className="p-1 hover:bg-white/10 rounded text-white/30 cursor-not-allowed"><Square size={12} /></button>
          <button onClick={() => onClose(win.id)} className="p-1 hover:bg-red-500 rounded"><X size={14} /></button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AppComp />
      </div>
    </div>
  );
};

const Taskbar = ({ windows, onOpen, onMinimize, color }: { 
  windows: WindowState[], 
  onOpen: (id: AppId) => void,
  onMinimize: (id: string) => void,
  color: string
}) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine which app is currently focused (topmost non-minimized window)
  const focusedAppId = windows
    .filter(w => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.appId;

  return (
    <div className={`h-12 absolute bottom-0 w-full backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 z-[9999] transition-colors duration-300 ${color}`}>
      {/* Start & Widgets */}
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-white/10 rounded-md transition duration-200 group">
          <LayoutGrid size={24} className="text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
        <div className="flex items-center gap-2">
            <div className="bg-white/5 rounded-full p-2 hover:bg-white/10 cursor-pointer">
                <Search size={16} className="text-white/70" />
            </div>
        </div>
      </div>

      {/* Center Apps */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {APPS.map(app => {
          const isOpen = windows.some(w => w.appId === app.id);
          const isFocused = focusedAppId === app.id;
          
          return (
            <button 
              key={app.id}
              onClick={() => {
                 const existing = windows.find(w => w.appId === app.id);
                 if (existing) {
                    onMinimize(existing.id); 
                 } else {
                    onOpen(app.id);
                 }
              }}
              className={`p-2 rounded-md transition-all duration-300 relative group
              ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}
              ${isFocused ? 'shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-white/20 scale-110 ring-1 ring-cyan-400/30' : ''}
              `}
            >
              <div className={`transition-transform duration-300 ${isOpen ? 'scale-100' : 'group-hover:scale-110'}`}>
                {React.cloneElement(app.icon as any, { 
                  size: 24, 
                  className: isFocused ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : (isOpen ? 'text-cyan-400' : 'text-white/80')
                })}
              </div>
              {isOpen && <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isFocused ? 'bg-cyan-300 w-4 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-white/40'} transition-all duration-300`}></div>}
            </button>
          );
        })}
      </div>

      {/* Tray */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded cursor-default">
           <Wifi size={14} />
           <Volume2 size={14} />
           <Battery size={14} />
        </div>
        <div className="text-right leading-tight px-2 py-1 hover:bg-white/10 rounded cursor-default">
           <div>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
           <div className="text-[10px] text-white/60">{time.toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};

const DesktopIcon: React.FC<{ app: AppConfig; onOpen: () => void }> = ({ app, onOpen }) => (
  <button 
    onClick={onOpen}
    className="flex flex-col items-center gap-1 p-4 rounded hover:bg-white/10 transition group w-24 text-center"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform text-white">
      {React.cloneElement(app.icon as any, { size: 28 })}
    </div>
    <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{app.name}</span>
  </button>
);

const App = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [zIndexCounter, setZIndexCounter] = useState(100);
  const [isLandscape, setIsLandscape] = useState(true);
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
  const [taskbarColor, setTaskbarColor] = useState('bg-slate-900/60');

  useEffect(() => {
    const checkOrientation = () => {
      // Allow if width > height OR if it's a desktop browser (assumption based on user agent or simple size check)
      // Strict mobile check:
      const isLand = window.innerWidth > window.innerHeight;
      setIsLandscape(isLand);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const openApp = (appId: AppId) => {
    const existing = windows.find(w => w.appId === appId);
    
    if (existing) {
      // Bring to front
      focusWindow(existing.id);
      if (existing.isMinimized) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
      return;
    }

    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    // Randomize slightly so they don't stack perfectly
    const offset = windows.length * 20;
    
    const newWindow: WindowState = {
      id: generateId(),
      appId,
      title: app.name,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: zIndexCounter + 1,
      position: { 
        x: 100 + (Math.random() * 50), 
        y: 50 + (Math.random() * 50) 
      },
      size: app.defaultSize || { width: 400, height: 300 }
    };

    setZIndexCounter(c => c + 1);
    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setZIndexCounter(c => c + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter + 1 } : w));
  };

  const toggleMinimize = (id: string) => {
      const win = windows.find(w => w.id === id);
      if (win?.isMinimized) {
          // restore
          focusWindow(id);
          setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false } : w));
      } else {
          // minimize
          setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
      }
  };

  if (!isLandscape) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
        <RotateCcw className="w-16 h-16 text-cyan-500 mb-6 animate-spin-slow" />
        <h1 className="text-2xl font-bold mb-2">Please Rotate Your Device</h1>
        <p className="text-gray-400">AnshOS Mobile is designed for landscape mode only.</p>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ wallpaper, setWallpaper, taskbarColor, setTaskbarColor }}>
      <div className="relative h-screen w-screen bg-cover bg-center overflow-hidden transition-all duration-500" style={{ backgroundImage: `url(${wallpaper})` }}>
        {/* Desktop Grid */}
        <div className="absolute inset-0 p-4 flex flex-col flex-wrap content-start gap-2">
          {APPS.map(app => (
            <DesktopIcon key={app.id} app={app} onOpen={() => openApp(app.id)} />
          ))}
        </div>

        {/* Windows Layer */}
        {windows.map(win => (
          <WindowFrame 
            key={win.id} 
            window={win} 
            onClose={closeWindow}
            onFocus={focusWindow}
            onMinimize={toggleMinimize}
          />
        ))}

        {/* Taskbar */}
        <Taskbar 
          windows={windows} 
          onOpen={openApp}
          onMinimize={(id) => toggleMinimize(id)}
          color={taskbarColor}
        />
      </div>
    </ThemeContext.Provider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);