import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom';

window.addEventListener("load", () => {
    ReactDOM.render(<App />, document.querySelector(".container-fluid"));
});