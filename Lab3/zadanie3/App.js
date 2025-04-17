function App() {
    const [resultMain, setResultMain] = React.useState("0");
    const [resultWorker, setResultWorker] = React.useState("0");

    const handleMainThreadCalc = () => {
        const iterations = parseInt(document.getElementById("iterations_main").value) || 50;
        const result = calculatePrimes(iterations);
        setResultMain(result.join(", "));
    };

    const handleWorkerCalc = () => {
        const iterations = parseInt(document.getElementById("iterations_worker").value) || 50;
        const worker = new Worker("worker.js");

        worker.onmessage = (e) => {
            const primes = e.data;
            setResultWorker(primes.join(", "));
        };

        worker.onerror = (e) => {
            alert("Worker error:\n" + e.message);
        };

        worker.postMessage(iterations);
    };

    return (
        <div>
            <h2>React Counters</h2>
            <Counter initial="10" delay="1000" />
            <Counter initial="15" delay="500" />
            <Counter initial="0" delay="200" />

            <hr />
            <h2>Time-consuming calculations in the main thread</h2>
            <label>Result: <output id="result_main">{resultMain}</output></label><br />
            <label>Number of iterations: </label>
            <input id="iterations_main" type="text" defaultValue="50"
                   onFocus={() => setResultMain("0")} />
            <button onClick={handleMainThreadCalc}>Run calculations</button>

            <hr />
            <h2>Time-consuming calculations in a separate thread</h2>
            <label>Result: <output id="result_worker">{resultWorker}</output></label><br />
            <label>Number of iterations: </label>
            <input id="iterations_worker" type="text" defaultValue="50"
                   onFocus={() => setResultWorker("0")} />
            <button onClick={handleWorkerCalc}>Run calculations</button>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);