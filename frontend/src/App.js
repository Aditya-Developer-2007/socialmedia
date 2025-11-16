import './App.css'
import React,{createContext, useEffect, useReducer,useContext} from 'react'
import NavBar from './components/NavBar';
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import Home from './components/screens/Home';
// Signin/Signup ki jagah Auth
import Auth from './components/screens/Auth';
import Profile from './components/screens/Profile';
import CreatePost from './components/screens/CreatePost';
import { initialState, reducer } from './components/reducers/userReducer';
import UserProfile from './components/screens/UserProfile';
import SubscribedUserPost from './components/screens/SubscribedUserPost';

export const UserContext = createContext();

const Routing = ()=>{
  const history = useHistory();
  const {state,dispatch} = useContext(UserContext);
  
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    
    if(user){
      // 1. User hai? State update karo
      dispatch({type:"USER",payload:user})
      
      // 2. Aur use seedha HOME PAGE par bhej do
      // (Yeh line pehle missing thi)
      history.push('/') 

    }else{
      // 3. User nahi hai? Use AUTH PAGE par bhejo
      history.push('/auth')
    }
  },[]) // Yeh code app load hote hi 1 baar chalta hai
  
  
  return (
      <Switch>
        <Route path="/" exact>
          <Home/>
        </Route>
        <Route path="/auth">
          <Auth/>
        </Route>
        <Route exact path="/profile" >
          <Profile/>
        </Route>
        <Route path="/profile/:userId">
          <UserProfile/>
        </Route>
        <Route path="/createpost">
          <CreatePost/>
        </Route>
        <Route path="/myfollowingpost">
          <SubscribedUserPost/>
        </Route>
    </Switch>
)
}

function App() {

  const [state,dispatch] = useReducer(reducer,initialState)

  return (
    <UserContext.Provider value={{state,dispatch}}>
    <BrowserRouter>
      <NavBar/>
      <Routing/>
    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;