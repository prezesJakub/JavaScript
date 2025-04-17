function Counter({ initial, delay }) {
    const [count, setCount] = React.useState(parseInt(initial));
    const [running, setRunning] = React.useState(false);
    const intervalRef = React.useRef(null);

    const start = () => {
        if (!running) {
            setRunning(true);
            intervalRef.current = setInterval(() => {
                setCount(prev => prev + 1);
            }, parseInt(delay));
        }
    };

    const stop = () => {
        setRunning(false);
        clearInterval(intervalRef.current);
    };

    React.useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <div className="counter-box">
            <div>Counter→ <span className="counter-value">{count}</span></div>
            <button onClick={start}>Start</button>
            <button onClick={stop}>Stop</button>
        </div>
    );
}