import React from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Questions from './components/questions/Questions';
import Question from './components/questions/Question';
import Callback from './components/Callback'
import SecuredRoute from './components/SecuredRoute/SecuredRoute';
import NewQuestion from './components/questions/NewQuestion'

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <Link to="/new-question">add</Link>
      <Route exact path='/callback' component={Callback} />
      <Route exact path='/question/:questionId' component={Question} />
      <SecuredRoute path='/new-question' component={NewQuestion} />
      <Route path='/' component={Questions} />
    </div>
  );
}

export default App;
