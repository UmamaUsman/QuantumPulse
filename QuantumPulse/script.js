// Quantum Curiosity Facts + Interactive Qubit Simulator (Bloch representation)

// --- Quantum Fact Generator ---
const quantumFacts = [
    "🧬 A quantum computer with just 300 qubits could store more numbers than there are atoms in the observable universe.",
    "🔐 Quantum key distribution (BB84) uses polarized photons — any eavesdropper leaves detectable errors, making it unhackable.",
    "⚛️ In 2019, Google's Sycamore processor achieved 'quantum supremacy' solving a problem in 200 seconds that would take a supercomputer 10,000 years.",
    "🐈 Schrödinger's cat wasn't a real experiment — it was a thought experiment to highlight the absurdity of the Copenhagen interpretation.",
    "🌀 Quantum entanglement works regardless of distance — even across galaxies, instant correlation remains.",
    "🌱 Quantum biology suggests that European robins may use entanglement to sense Earth's magnetic field for navigation.",
    "💊 Pharmaceutical companies use quantum simulations to model molecular interactions for new COVID-19 treatments.",
    "🔮 The Many-Worlds interpretation implies there's a universe where you made every different choice possible.",
    "🎲 Heisenberg's Uncertainty Principle has nothing to do with measurement limits — it's a fundamental property of matter.",
    "⚡ Quantum tunneling enables the Sun to fuse hydrogen into helium at 'low' temperatures (10 million °C)."
];

const factDisplay = document.getElementById('factDisplay');
const randomFactBtn = document.getElementById('randomFactBtn');
const exploreBtn = document.getElementById('exploreBtn');

function showRandomFact() {
    const randomIndex = Math.floor(Math.random() * quantumFacts.length);
    factDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> ${quantumFacts[randomIndex]}`;
}

if(randomFactBtn) {
    randomFactBtn.addEventListener('click', showRandomFact);
    // show initial fact
    showRandomFact();
}

// explore btn scroll to core concepts
if(exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        document.getElementById('core')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// --- Qubit Simulator (simple state representation) ---
// Representing a qubit state vector [alpha, beta] for |ψ⟩ = α|0⟩ + β|1⟩
let qubitAmplitude = { real0: 1, real1: 0 };  // |0⟩ state

const blochPoint = document.getElementById('blochPoint');
const qubitStateSpan = document.getElementById('qubitStateText');
const measureResultDiv = document.getElementById('measureResult');
const applyHadamardBtn = document.getElementById('applyHadamard');
const measureBtn = document.getElementById('measureQubit');
const resetBtn = document.getElementById('resetQubit');

// Helper: map amplitudes to Bloch sphere coordinates (X,Y,Z)
// For pure state: x = 2*Re(α*β̅), y = 2*Im(α*β̅), z = |α|² - |β|²
function amplitudesToBloch(alphaReal, alphaImag, betaReal, betaImag) {
    const mag0 = Math.hypot(alphaReal, alphaImag);
    const mag1 = Math.hypot(betaReal, betaImag);
    if (mag0 + mag1 < 1e-6) return { x: 0, y: 0, z: 0 };
    // Normalization to ensure |α|²+|β|²=1 (should be)
    const norm = Math.sqrt(mag0*mag0 + mag1*mag1);
    const a_r = alphaReal / norm, a_i = alphaImag / norm;
    const b_r = betaReal / norm, b_i = betaImag / norm;
    const x = 2 * (a_r * b_r + a_i * b_i);
    const y = 2 * (a_r * b_i - a_i * b_r);
    const z = (a_r*a_r + a_i*a_i) - (b_r*b_r + b_i*b_i);
    return { x, y, z };
}

function updateBlochVisual() {
    // current state: amplitudes (real-only for simplicity but allow sign)
    let alphaReal = qubitAmplitude.real0;
    let betaReal = qubitAmplitude.real1;
    let alphaImag = 0, betaImag = 0;
    const { x, y, z } = amplitudesToBloch(alphaReal, alphaImag, betaReal, betaImag);
    // map x,y,z from [-1,1] to position inside sphere: left/right, up/down, forward/back but in 2D projection we use X and Z.
    const sphereSize = 200;
    const centerX = 100, centerY = 100;
    const pointX = centerX + (x * 70);
    const pointY = centerY - (z * 70);  // Z up-down
    if(blochPoint) {
        blochPoint.style.left = `${pointX}px`;
        blochPoint.style.top = `${pointY}px`;
        // change color based on state
        const prob0 = alphaReal*alphaReal;
        const prob1 = betaReal*betaReal;
        blochPoint.style.background = `radial-gradient(circle, #ffb347, #ff7e5e)`;
        if(prob1 > 0.8) blochPoint.style.background = `radial-gradient(circle, #7e5eff, #5a3fcf)`;
    }
    // update text representation
    let prob0 = (qubitAmplitude.real0 ** 2).toFixed(3);
    let prob1 = (qubitAmplitude.real1 ** 2).toFixed(3);
    if (Math.abs(prob0 + prob1 - 1) > 0.001) {
        // re-normalize
        let norm2 = (qubitAmplitude.real0 ** 2 + qubitAmplitude.real1 ** 2);
        if(norm2 > 0) {
            prob0 = (qubitAmplitude.real0 ** 2 / norm2).toFixed(3);
            prob1 = (qubitAmplitude.real1 ** 2 / norm2).toFixed(3);
        }
    }
    if(Math.abs(qubitAmplitude.real1) < 0.001 && Math.abs(qubitAmplitude.real0) > 0.99) {
        qubitStateSpan.innerHTML = '|0⟩';
    } else if(Math.abs(qubitAmplitude.real0) < 0.001 && Math.abs(qubitAmplitude.real1) > 0.99) {
        qubitStateSpan.innerHTML = '|1⟩';
    } else {
        qubitStateSpan.innerHTML = `√${prob0} |0⟩ + √${prob1} |1⟩`;
    }
}

function applyHadamard() {
    // H matrix: [1/√2, 1/√2; 1/√2, -1/√2] on real amplitudes
    let a = qubitAmplitude.real0;
    let b = qubitAmplitude.real1;
    const invSqrt2 = 1 / Math.sqrt(2);
    let newA = invSqrt2 * (a + b);
    let newB = invSqrt2 * (a - b);
    qubitAmplitude.real0 = newA;
    qubitAmplitude.real1 = newB;
    updateBlochVisual();
    if(measureResultDiv) measureResultDiv.innerHTML = `<span class="explain-text">🌀 Superposition applied! Qubit is now in a balanced state |+⟩ = (|0⟩+|1⟩)/√2</span>`;
}

function measureQubit() {
    const prob0 = qubitAmplitude.real0 ** 2;
    const prob1 = qubitAmplitude.real1 ** 2;
    const norm = prob0 + prob1;
    const r = Math.random();
    let outcome = 0;
    if (r < (prob0 / norm)) outcome = 0;
    else outcome = 1;
    // collapse state
    if (outcome === 0) {
        qubitAmplitude.real0 = 1;
        qubitAmplitude.real1 = 0;
        measureResultDiv.innerHTML = `<span class="explain-text">🎲 Measurement outcome: <strong>|0⟩</strong> — Qubit collapsed to classical bit 0.</span>`;
    } else {
        qubitAmplitude.real0 = 0;
        qubitAmplitude.real1 = 1;
        measureResultDiv.innerHTML = `<span class="explain-text">⚡ Measurement outcome: <strong>|1⟩</strong> — Qubit collapsed to classical bit 1.</span>`;
    }
    updateBlochVisual();
}

function resetQubit() {
    qubitAmplitude.real0 = 1;
    qubitAmplitude.real1 = 0;
    updateBlochVisual();
    if(measureResultDiv) measureResultDiv.innerHTML = `<span class="explain-text">⟳ Reset to |0⟩ basis state. Qubit is purely classical.</span>`;
}

if(applyHadamardBtn) applyHadamardBtn.addEventListener('click', applyHadamard);
if(measureBtn) measureBtn.addEventListener('click', measureQubit);
if(resetBtn) resetBtn.addEventListener('click', resetQubit);

// Mobile nav toggle (simple)
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
if(menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        if(navLinks.style.display === 'flex') navLinks.style.display = 'none';
        else navLinks.style.display = 'flex';
    });
    window.addEventListener('resize', () => {
        if(window.innerWidth > 768) navLinks.style.display = 'flex';
        else if(navLinks.style.display !== 'flex') navLinks.style.display = '';
    });
}

// Initialize
updateBlochVisual();
// Add moving quantum sphere background pulse
const sphere = document.getElementById('quantumSphere');
if(sphere) {
    setInterval(() => {
        sphere.style.boxShadow = `0 0 ${Math.sin(Date.now() / 1000) * 20 + 40}px rgba(108, 92, 231, 0.6)`;
    }, 200);
}