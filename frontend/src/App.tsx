import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';
import WebcamComponent from "./WebcamComponent";
import StoryComponent from './StoryComponent';

function App() {
  const [data, setData] = useState<{message: string}>({message: ''});

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data') // Replace '/api/data' with the actual endpoint of your Flask backend
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Hello from our project! This is the frontend.
        </p>

        {data && (
          <p>
            Data from backend: {data.message}
          </p>
        )}

        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>
          <WebcamComponent />
        </div>
        <div>
          <StoryComponent />
        </div>
      </header>
    </div>
  );
}

export default App;
