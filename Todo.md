Apply the design from the below design below:



<!-- Design System -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Inter:wght@300;400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-tertiary": "#00354a",
              "tertiary-container": "#009bd1",
              "on-secondary-fixed-variant": "#5516be",
              "surface-variant": "#2d3449",
              "background": "#0b1326",
              "inverse-on-surface": "#283044",
              "surface-tint": "#adc6ff",
              "on-surface-variant": "#c2c6d6",
              "on-secondary-container": "#c4abff",
              "on-primary-fixed-variant": "#004395",
              "tertiary-fixed": "#c4e7ff",
              "surface-container-highest": "#2d3449",
              "secondary-container": "#571bc1",
              "on-tertiary-fixed-variant": "#004c69",
              "surface-container-lowest": "#060e20",
              "primary": "#adc6ff",
              "secondary-fixed": "#e9ddff",
              "on-primary-fixed": "#001a42",
              "on-error-container": "#ffdad6",
              "on-error": "#690005",
              "surface-container-high": "#222a3d",
              "on-background": "#dae2fd",
              "on-primary": "#002e6a",
              "on-primary-container": "#00285d",
              "surface-container-low": "#131b2e",
              "on-secondary": "#3c0091",
              "inverse-primary": "#005ac2",
              "secondary-fixed-dim": "#d0bcff",
              "outline-variant": "#424754",
              "surface-dim": "#0b1326",
              "on-secondary-fixed": "#23005c",
              "on-tertiary-fixed": "#001e2c",
              "primary-fixed-dim": "#adc6ff",
              "on-surface": "#dae2fd",
              "surface-bright": "#31394d",
              "primary-container": "#4d8eff",
              "error": "#ffb4ab",
              "outline": "#8c909f",
              "error-container": "#93000a",
              "tertiary-fixed-dim": "#7bd0ff",
              "primary-fixed": "#d8e2ff",
              "secondary": "#d0bcff",
              "surface-container": "#171f33",
              "surface": "#0b1326",
              "tertiary": "#7bd0ff",
              "inverse-surface": "#dae2fd",
              "on-tertiary-container": "#002d40"
            },
            fontFamily: {
              "headline": ["Space Grotesk"],
              "body": ["Inter"],
              "label": ["Inter"],
              "mono": ["JetBrains Mono"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .tonal-transition {
            background: linear-gradient(180deg, #0b1326 0%, #171f33 100%);
        }
        .neural-glow {
            background: radial-gradient(circle at center, rgba(173, 198, 255, 0.15) 0%, transparent 70%);
        }
        .glass-card {
            background: rgba(34, 42, 61, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(66, 71, 84, 0.2);
        }
        .hero-gradient {
            background: radial-gradient(circle at 20% 30%, rgba(77, 142, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(123, 208, 255, 0.1) 0%, transparent 50%);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-surface font-body selection:bg-primary-container/30">
<!-- NavigationDrawer (Shared Component) -->
<aside class="fixed left-0 top-0 h-full z-40 flex flex-col h-screen w-72 border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
<div class="p-8">
<span class="text-2xl font-bold tracking-tighter text-blue-400 font-headline">ML Learn</span>
</div>
<nav class="flex-1 px-4 space-y-2 mt-4">
<!-- Supervised (Active Example) -->
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-r-2 border-blue-500 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="layers">layers</span>
<span>Supervised</span>
</a>
<!-- Unsupervised -->
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="psychology">psychology</span>
<span>Unsupervised</span>
</a>
<!-- Deep Learning -->
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="model_training">model_training</span>
<span>Deep Learning</span>
</a>
</nav>
<div class="p-6 border-t border-white/5">
<div class="flex items-center gap-3 px-2">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
<span class="material-symbols-outlined text-primary" data-icon="person">person</span>
</div>
<div>
<p class="text-sm font-medium text-slate-100">Researcher</p>
<p class="text-xs text-slate-500">Tier: Elite</p>
</div>
</div>
</div>
</aside>
<!-- TopAppBar (Shared Component) -->
<header class="flex items-center justify-between px-8 w-full z-30 ml-72 max-w-[calc(100%-18rem)] h-16 sticky top-0 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
<div class="flex items-center gap-4">
<span class="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform cursor-pointer" data-icon="search">search</span>
<h1 class="font-['Space_Grotesk'] text-xl md:text-2xl text-slate-100 font-bold tracking-tight">The Digital Observatory</h1>
</div>
<div class="flex items-center gap-6">
<div class="hidden md:flex gap-6">
<a class="text-indigo-400 font-bold hover:text-blue-400 transition-colors text-sm uppercase tracking-widest" href="#">Dashboard</a>
<a class="text-slate-400 hover:text-blue-400 transition-colors text-sm uppercase tracking-widest" href="#">Library</a>
<a class="text-slate-400 hover:text-blue-400 transition-colors text-sm uppercase tracking-widest" href="#">Playground</a>
</div>
<span class="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform cursor-pointer" data-icon="terminal">terminal</span>
</div>
</header>
<!-- Main Content Wrapper -->
<main class="ml-72 min-h-screen hero-gradient">
<!-- Hero Section -->
<section class="px-12 py-24 relative overflow-hidden">
<div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
<div class="max-w-4xl relative z-10">
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Now Enrolling: Advanced Neural Architectures
                </div>
<h2 class="font-headline text-6xl md:text-7xl font-bold text-on-surface leading-[1.1] tracking-tight mb-8">
                    Understand AI, <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Mathematically</span> &amp; Intuitively
                </h2>
<p class="text-on-surface-variant text-xl max-w-2xl leading-relaxed mb-12">
                    Peer into the black box of machine learning with interactive visualizations, 
                    rigorous mathematical derivations, and hands-on laboratory environments.
                </p>
<div class="flex flex-wrap gap-4">
<button class="px-8 py-4 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all cubic-bezier(0.175, 0.885, 0.32, 1.275) flex items-center gap-3 shadow-lg shadow-primary/20">
                        Start Learning
                        <span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
<button class="px-8 py-4 rounded-lg bg-surface-container-high text-on-surface font-semibold text-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
                        Explore Curriculum
                    </button>
</div>
</div>
</section>
<!-- Algorithm Bento Grid -->
<section class="px-12 pb-24">
<div class="flex items-end justify-between mb-12">
<div>
<h3 class="font-headline text-3xl font-bold text-slate-50 mb-2">Core Foundations</h3>
<p class="text-slate-400">Master the fundamental algorithms powering modern intelligence.</p>
</div>
<div class="flex gap-2">
<button class="p-2 rounded-full bg-surface-container-low border border-outline-variant/20 text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button class="p-2 rounded-full bg-surface-container-low border border-outline-variant/20 text-slate-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Card 1: Linear Regression -->
<div class="glass-card p-8 rounded-xl group hover:border-primary/40 transition-all duration-500 relative overflow-hidden">
<div class="absolute inset-0 neural-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
<div class="relative z-10">
<div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-500">
<span class="material-symbols-outlined text-3xl" data-icon="show_chart">show_chart</span>
</div>
<h4 class="font-headline text-2xl font-semibold text-slate-50 mb-3 tracking-tight">Linear Regression</h4>
<p class="text-on-surface-variant leading-relaxed mb-8">The cornerstone of predictive modeling. Learn the mathematics of Gradient Descent and ordinary least squares.</p>
<div class="flex items-center justify-between">
<span class="font-mono text-xs text-primary/70 bg-primary/5 px-2 py-1 rounded">f(x) = wx + b</span>
<a class="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all" href="#">
                                Learn More
                                <span class="material-symbols-outlined" data-icon="trending_flat">trending_flat</span>
</a>
</div>
</div>
</div>
<!-- Card 2: Decision Trees -->
<div class="glass-card p-8 rounded-xl group hover:border-tertiary/40 transition-all duration-500 relative overflow-hidden">
<div class="absolute inset-0 neural-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
<div class="relative z-10">
<div class="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6 border border-tertiary/20 text-tertiary group-hover:scale-110 transition-transform duration-500">
<span class="material-symbols-outlined text-3xl" data-icon="account_tree">account_tree</span>
</div>
<h4 class="font-headline text-2xl font-semibold text-slate-50 mb-3 tracking-tight">Decision Trees</h4>
<p class="text-on-surface-variant leading-relaxed mb-8">Master the logic of recursive partitioning and entropy. Understand how complex decisions are decomposed.</p>
<div class="flex items-center justify-between">
<span class="font-mono text-xs text-tertiary/70 bg-tertiary/5 px-2 py-1 rounded">Entropy: -∑ p log p</span>
<a class="flex items-center gap-2 text-tertiary font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all" href="#">
                                Learn More
                                <span class="material-symbols-outlined" data-icon="trending_flat">trending_flat</span>
</a>
</div>
</div>
</div>
<!-- Card 3: K-Means Clustering -->
<div class="glass-card p-8 rounded-xl group hover:border-secondary/40 transition-all duration-500 relative overflow-hidden">
<div class="absolute inset-0 neural-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
<div class="relative z-10">
<div class="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 text-secondary group-hover:scale-110 transition-transform duration-500">
<span class="material-symbols-outlined text-3xl" data-icon="bubble_chart">bubble_chart</span>
</div>
<h4 class="font-headline text-2xl font-semibold text-slate-50 mb-3 tracking-tight">K-Means</h4>
<p class="text-on-surface-variant leading-relaxed mb-8">Unsupervised discovery of patterns. Explore centroid optimization and spatial partitioning in high dimensions.</p>
<div class="flex items-center justify-between">
<span class="font-mono text-xs text-secondary/70 bg-secondary/5 px-2 py-1 rounded">Dist: ||x - μ||²</span>
<a class="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all" href="#">
                                Learn More
                                <span class="material-symbols-outlined" data-icon="trending_flat">trending_flat</span>
</a>
</div>
</div>
</div>
</div>
</section>
<!-- Technical Demo Section -->
<section class="px-12 pb-32">
<div class="bg-surface-container rounded-3xl overflow-hidden border border-white/5 flex flex-col lg:flex-row shadow-2xl">
<div class="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
<h3 class="font-headline text-4xl font-bold text-slate-50 mb-6">Interactive Neural Playground</h3>
<p class="text-slate-400 text-lg leading-relaxed mb-8">
                        Adjust hyperparameters in real-time and watch the decision boundaries shift. 
                        Our built-in simulator runs on WebGL, giving you near-native performance for 
                        training models directly in your browser.
                    </p>
<ul class="space-y-4 mb-10">
<li class="flex items-center gap-3 text-on-surface">
<span class="material-symbols-outlined text-primary" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            Real-time GPU accelerated training
                        </li>
<li class="flex items-center gap-3 text-on-surface">
<span class="material-symbols-outlined text-primary" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            Export to PyTorch or TensorFlow
                        </li>
</ul>
<button class="w-fit px-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                        Launch Simulator
                    </button>
</div>
<div class="lg:w-1/2 bg-surface-container-highest p-8 relative">
<div class="rounded-xl overflow-hidden shadow-inner border border-white/10 h-full bg-slate-950 p-4 font-mono text-sm">
<div class="flex items-center gap-2 mb-4">
<div class="w-3 h-3 rounded-full bg-red-500/50"></div>
<div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
<div class="w-3 h-3 rounded-full bg-green-500/50"></div>
<span class="ml-4 text-slate-500">model_factory.py</span>
</div>
<code class="text-blue-300">class</code> <code class="text-indigo-400">NeuralEngine</code>(nn.Module):<br/>
                          <code class="text-blue-300">def</code> <code class="text-indigo-400">__init__</code>(self, input_dim):<br/>
                            super().__init__()<br/>
                            self.layers = nn.Sequential(<br/>
                              nn.Linear(input_dim, 128),<br/>
                              nn.ReLU(),<br/>
                              nn.Dropout(0.2),<br/>
                              nn.Linear(128, 1),<br/>
                              nn.Sigmoid()<br/>
                            )<br/><br/>
<code class="text-slate-500"># Initializing the observatory engine</code><br/>
                        engine = NeuralEngine(64).to(<code class="text-tertiary-fixed-dim">'cuda'</code>)<br/>
                        print(<code class="text-tertiary-fixed-dim">"Engine Ready: Luminous state active"</code>)
                        
                        <div class="mt-8 pt-8 border-t border-white/5">
<img alt="abstract data visualization" class="w-full h-48 object-cover rounded-lg opacity-80" data-alt="Abstract 3D network visualization with glowing nodes and cyan connection lines on a dark minimalist background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9ZEuELMF3T6Pwq0WIKvYOtV1CO5l32ase_rjlrueFxhrKKpxUzaXX8JdrOM9e2-yZLwT7ilcxsJhh2RbxSuRpGP4tetkvqjPHbASfUFdvkeb3yjGF8C9HZvonbNxFq_aHf26Sj-1XquoVCU0zvQTFxkP_RBZJWr95HWl8oZNn8Oz-F9x9B0dJ4VIHQj2LDVcVN6SbjMUd7BLf4Xyx4lfT6EZrxupFR1b64JEvfHTyoN4_f5n0MQ7rD333mTDae-gE-DblHjf1uPeZ"/>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- Floating Action Button Contextual Logic: Suppressed on Dashboard/Landing per requirements -->
</body></html>

<!-- ML Learn Dashboard -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "on-tertiary": "#00354a",
              "tertiary-container": "#009bd1",
              "on-secondary-fixed-variant": "#5516be",
              "surface-variant": "#2d3449",
              "background": "#0b1326",
              "inverse-on-surface": "#283044",
              "surface-tint": "#adc6ff",
              "on-surface-variant": "#c2c6d6",
              "on-secondary-container": "#c4abff",
              "on-primary-fixed-variant": "#004395",
              "tertiary-fixed": "#c4e7ff",
              "surface-container-highest": "#2d3449",
              "secondary-container": "#571bc1",
              "on-tertiary-fixed-variant": "#004c69",
              "surface-container-lowest": "#060e20",
              "primary": "#adc6ff",
              "secondary-fixed": "#e9ddff",
              "on-primary-fixed": "#001a42",
              "on-error-container": "#ffdad6",
              "on-error": "#690005",
              "surface-container-high": "#222a3d",
              "on-background": "#dae2fd",
              "on-primary": "#002e6a",
              "on-primary-container": "#00285d",
              "surface-container-low": "#131b2e",
              "on-secondary": "#3c0091",
              "inverse-primary": "#005ac2",
              "secondary-fixed-dim": "#d0bcff",
              "outline-variant": "#424754",
              "surface-dim": "#0b1326",
              "on-secondary-fixed": "#23005c",
              "on-tertiary-fixed": "#001e2c",
              "primary-fixed-dim": "#adc6ff",
              "on-surface": "#dae2fd",
              "surface-bright": "#31394d",
              "primary-container": "#4d8eff",
              "error": "#ffb4ab",
              "outline": "#8c909f",
              "error-container": "#93000a",
              "tertiary-fixed-dim": "#7bd0ff",
              "primary-fixed": "#d8e2ff",
              "secondary": "#d0bcff",
              "surface-container": "#171f33",
              "surface": "#0b1326",
              "tertiary": "#7bd0ff",
              "inverse-surface": "#dae2fd",
              "on-tertiary-container": "#002d40"
            },
            fontFamily: {
              "headline": ["Space Grotesk"],
              "body": ["Inter"],
              "label": ["Inter"],
              "mono": ["JetBrains Mono"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .tonal-transition {
            background: linear-gradient(180deg, rgba(11,19,38,1) 0%, rgba(23,31,51,1) 100%);
        }
        .glass-card {
            background: rgba(45, 52, 73, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(66, 71, 84, 0.2);
        }
        .neural-glow {
            position: absolute;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(173, 198, 255, 0.08) 0%, rgba(173, 198, 255, 0) 70%);
            z-index: -1;
            pointer-events: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-surface font-body selection:bg-primary/30">
<!-- NavigationDrawer Shell -->
<aside class="fixed left-0 top-0 h-full z-40 flex flex-col h-screen w-72 border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
<div class="p-8">
<span class="text-2xl font-bold tracking-tighter text-blue-400">ML Learn</span>
</div>
<nav class="flex-1 px-4 space-y-2">
<!-- Active State: Supervised -->
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-r-2 border-blue-500 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="layers">layers</span>
                Supervised
            </a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="psychology">psychology</span>
                Unsupervised
            </a>
<a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ease-out hover:translate-x-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-['Space_Grotesk'] font-medium tracking-tight" href="#">
<span class="material-symbols-outlined" data-icon="model_training">model_training</span>
                Deep Learning
            </a>
</nav>
<div class="p-6 mt-auto">
<div class="glass-card rounded-xl p-4 text-xs text-on-surface-variant">
<p>System Version: 2.4.0-Stable</p>
<p class="mt-1">Neural Engine: Active</p>
</div>
</div>
</aside>
<!-- TopAppBar Shell -->
<header class="flex items-center justify-between px-8 w-full z-30 ml-72 max-w-[calc(100%-18rem)] w-full h-16 sticky top-0 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform" data-icon="search">search</button>
<h1 class="font-['Space_Grotesk'] text-2xl text-slate-100 font-bold tracking-tight">The Digital Observatory</h1>
</div>
<div class="flex items-center gap-6">
<span class="text-indigo-400 font-bold font-['Space_Grotesk']">Docs</span>
<span class="text-slate-400 hover:text-blue-400 transition-colors font-['Space_Grotesk']">Resources</span>
<button class="material-symbols-outlined text-indigo-400 hover:scale-105 active:scale-95 transition-transform" data-icon="terminal">terminal</button>
</div>
</header>
<!-- Main Content Canvas -->
<main class="ml-72 min-h-screen p-12 relative overflow-hidden">
<div class="neural-glow top-20 left-40"></div>
<div class="neural-glow bottom-40 right-20 bg-tertiary/5"></div>
<!-- Header Section -->
<section class="max-w-5xl mx-auto mb-16">
<div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                Supervised Learning
            </div>
<h2 class="font-headline text-6xl font-bold tracking-tighter text-on-surface mb-6">Linear Regression</h2>
<p class="text-xl text-on-surface-variant leading-relaxed max-w-3xl">
                The bedrock of predictive modeling. Linear regression models the relationship between a scalar response and one or more explanatory variables by fitting a linear equation to observed data.
            </p>
</section>
<!-- Bento Grid Content -->
<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
<!-- Intuition Section (Wide) -->
<div class="md:col-span-8 glass-card p-8 rounded-xl relative overflow-hidden">
<div class="relative z-10">
<div class="flex items-center gap-3 mb-4 text-tertiary">
<span class="material-symbols-outlined" data-icon="lightbulb">lightbulb</span>
<h3 class="font-headline text-2xl font-semibold">Real-World Intuition</h3>
</div>
<p class="text-on-surface-variant leading-relaxed">
                        Imagine you're trying to predict the price of a house based on its size. Generally, as square footage increases, the price follows suit in a relatively steady climb. Linear Regression is the "best-fit line" drawn through a cloud of data points that minimizes the distance between the line and every point, allowing us to predict future values with mathematical confidence.
                    </p>
<div class="mt-8 flex justify-center">
<img class="rounded-lg border border-outline-variant/30 grayscale hover:grayscale-0 transition-all duration-700 w-full h-48 object-cover" data-alt="abstract architectural visualization of diagonal clean lines and minimalist geometric shapes reflecting data trends" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT7sadsoUSX6Nf5ikMFK-31WcjmkG7R-20DwBxw-hOYm7Apfc6D-Kp5WaFbancCweNDU_MmRNSkWm5VnooYwuWlsFfVYylTMXtDev5GKj6BOk_9dZaTd9Z6hdoviEOUp_y2plW6UpZhG4zlStsVff8rtneIyckRmshtZLTy4Hya8A065-6wEznTHrm6WYxk56heOG0N32CRPQ4P4T1u4OoXG9NQg84AypHUlZAMhWhzPDF7W7ja4Gj850RwzolV67H3e2Xzm6jTY5z"/>
</div>
</div>
</div>
<!-- Math Section (Narrow/Tall) -->
<div class="md:col-span-4 bg-surface-container-high p-8 rounded-xl border border-outline-variant/10">
<div class="flex items-center gap-3 mb-6 text-primary">
<span class="material-symbols-outlined" data-icon="functions">functions</span>
<h3 class="font-headline text-xl font-semibold">The Logic</h3>
</div>
<div class="font-mono text-sm space-y-6 text-on-surface-variant">
<div class="p-4 bg-surface-container-lowest rounded-lg border-l-2 border-primary">
<p class="text-primary-fixed mb-2">Equation:</p>
<p class="text-lg text-on-surface">y = β₀ + β₁x + ε</p>
</div>
<div>
<p class="mb-4">Where:</p>
<ul class="space-y-3 opacity-80">
<li><span class="text-primary">y</span>: Dependent Variable</li>
<li><span class="text-primary">x</span>: Independent Variable</li>
<li><span class="text-primary">β₀</span>: Y-intercept</li>
<li><span class="text-primary">β₁</span>: Slope/Coefficient</li>
<li><span class="text-primary">ε</span>: Error Term</li>
</ul>
</div>
<div class="pt-4 border-t border-outline-variant/20">
<p class="text-xs italic">Optimized via Ordinary Least Squares (OLS)</p>
</div>
</div>
</div>
<!-- Code Block (Full Width) -->
<div class="md:col-span-12 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-white/5">
<div class="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-white/5">
<div class="flex gap-1.5">
<div class="w-3 h-3 rounded-full bg-error/40"></div>
<div class="w-3 h-3 rounded-full bg-tertiary/40"></div>
<div class="w-3 h-3 rounded-full bg-primary/40"></div>
</div>
<div class="flex items-center gap-4">
<span class="text-xs font-mono text-slate-500">model_fitting.py</span>
<button class="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
<span class="material-symbols-outlined text-sm" data-icon="content_copy">content_copy</span>
                            Copy
                        </button>
</div>
</div>
<div class="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
<pre class="text-slate-300"><span class="text-indigo-400">from</span> sklearn.linear_model <span class="text-indigo-400">import</span> LinearRegression
<span class="text-indigo-400">import</span> numpy <span class="text-indigo-400">as</span> np

<span class="text-slate-500"># 1. Prepare Synthetic Data</span>
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([1, 2.1, 2.9, 4.2, 5.1])

<span class="text-slate-500"># 2. Initialize and Fit Model</span>
model = LinearRegression()
model.fit(X, y)

<span class="text-slate-500"># 3. Predict &amp; Analyze</span>
prediction = model.predict([[6]])
<span class="text-indigo-400">print</span>(<span class="text-tertiary">f"R-squared: {model.score(X, y)}"</span>)
<span class="text-indigo-400">print</span>(<span class="text-tertiary">f"Prediction for X=6: {prediction[0]}"</span>)
</pre>
</div>
</div>
<!-- Pros & Cons (Asymmetric) -->
<div class="md:col-span-6 rounded-xl overflow-hidden group">
<div class="p-8 bg-gradient-to-br from-primary/20 to-surface-container h-full border border-primary/10 transition-transform duration-500 group-hover:scale-[1.01]">
<div class="flex items-center gap-3 mb-6">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined" data-icon="check_circle">check_circle</span>
</div>
<h3 class="font-headline text-2xl font-bold text-on-surface">Strengths</h3>
</div>
<ul class="space-y-4">
<li class="flex gap-4 items-start">
<span class="text-primary mt-1 material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
<span class="text-on-surface-variant">Exceptional interpretability; coefficients directly show feature impact.</span>
</li>
<li class="flex gap-4 items-start">
<span class="text-primary mt-1 material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
<span class="text-on-surface-variant">Highly efficient training; handles millions of rows with minimal compute.</span>
</li>
<li class="flex gap-4 items-start">
<span class="text-primary mt-1 material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
<span class="text-on-surface-variant">No hyperparameter tuning required for basic implementation.</span>
</li>
</ul>
</div>
</div>
<div class="md:col-span-6 rounded-xl overflow-hidden group">
<div class="p-8 bg-gradient-to-br from-error/10 to-surface-container h-full border border-error/10 transition-transform duration-500 group-hover:scale-[1.01]">
<div class="flex items-center gap-3 mb-6">
<div class="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error">
<span class="material-symbols-outlined" data-icon="warning">warning</span>
</div>
<h3 class="font-headline text-2xl font-bold text-on-surface">Limitations</h3>
</div>
<ul class="space-y-4">
<li class="flex gap-4 items-start">
<span class="text-error mt-1 material-symbols-outlined text-sm" data-icon="close">close</span>
<span class="text-on-surface-variant">Assumes linearity; fails spectacularly on complex non-linear patterns.</span>
</li>
<li class="flex gap-4 items-start">
<span class="text-error mt-1 material-symbols-outlined text-sm" data-icon="close">close</span>
<span class="text-on-surface-variant">Extremely sensitive to outliers which can skew the best-fit line.</span>
</li>
<li class="flex gap-4 items-start">
<span class="text-error mt-1 material-symbols-outlined text-sm" data-icon="close">close</span>
<span class="text-on-surface-variant">Prone to multicollinearity where features are highly correlated.</span>
</li>
</ul>
</div>
</div>
</div>
<!-- Footer Spacing -->
<footer class="max-w-5xl mx-auto mt-24 pt-8 border-t border-outline-variant/10 text-on-surface-variant flex justify-between items-center text-sm">
<p>© 2024 The Digital Observatory</p>
<div class="flex gap-6">
<a class="hover:text-primary transition-colors" href="#">Documentation</a>
<a class="hover:text-primary transition-colors" href="#">API Reference</a>
</div>
</footer>
</main>
</body></html>