import React from 'react';

import { Route, BrowserRouter } from 'react-router-dom';

import Home from './Pages/Home';
import CreatePontoColeta from './Pages/CreatePontoColeta';


const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreatePontoColeta} path="/cadastro-pontoColeta" />
    </BrowserRouter>
  );
}

export default Routes;