// index.js — точка входа React-приложения.Он связывает React-компоненты с HTML-страницей.

//библиотека React => без него браузер не поймёт, что такое <App /> или <div> внутри JSX.
import React from "react";
// модуль для рендеринга React-компонентов в DOM
import ReactDOM from "react-dom/client";
// Импортируем главный компонент приложения — App.js => рендерится в браузер
import App from "./App";

//Находим HTML-элемент с id "root" (обычно это <div id="root"></div> в public/index.html).
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

