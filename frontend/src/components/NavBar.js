import React, { useContext, useEffect, useRef,useState } from 'react'
import {Link,useHistory} from 'react-router-dom'
import { UserContext } from '../App'
import M from 'materialize-css'

const NavBar = () =>{
  const searchModal = useRef(null)
  const sidenavRef = useRef(null) // Sidenav ke liye naya Ref
  const {state,dispatch} = useContext(UserContext)
  const [search,setSearch] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const history = useHistory()
  
  const LogOut = () =>{
    if(window.confirm("Are you sure you want to log out?")){
      localStorage.clear()
      dispatch({type:'CLEAR'})
      history.push('/auth');
    }
  }
  
  useEffect(()=>{
    M.Modal.init(searchModal.current)
    M.Sidenav.init(sidenavRef.current) // Sidenav ko initialize kiya
  },[])

  const fetchUsers = (query) => {
    setSearch(query);
    if(!query){
        setSearchResults({ users: [], posts: [] });
        return;
    }
    fetch('https://devly-backend.onrender.com/api/search-all',{
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({
            query: query
        })
    }).then(res => res.json())
      .then(results => {
          setSearchResults(results);
          const instance = M.Modal.getInstance(searchModal.current);
          instance.open();
      }).catch(err => {
          console.log(err);
      })
  }

  const clearSearch = () => {
    setSearch(""); 
    setSearchResults({ users: [], posts: [] });
  }

  // Yeh links ab 2 jagah use honge: desktop nav aur mobile sidenav
  const renderList = () =>{
    if(state){
      return [
        <li key="home"><Link to="/" className="nav-icon-link"><i className="material-icons">home</i></Link></li>,
        <li key="profile"><Link to="/profile" className="nav-icon-link"><i className="material-icons">person</i></Link></li>,
        <li key="create"><Link to="/createpost" className="nav-icon-link"><i className="material-icons">add_box</i></Link></li>,
        <li key="following"><Link to="/myfollowingpost" className="nav-icon-link"><i className="material-icons">people</i></Link></li>,
        
        <li key="logout" className="logout-li">
          <button 
            className="btn waves-effect waves-light red darken-4"
            onClick={() => LogOut()}
          >
            Logout
          </button>
        </li>
      ]
    }else{
      return[
        <li key="auth"><Link to="/auth" className="nav-link-auth">Login / Signup</Link></li>
      ]
    }
  }

return (
    <> {/* Fragment add kiya taaki Sidenav bhi aa sake */}
    <nav className="main-nav-bar">
      <div className="nav-wrapper"> 
        
        {/* Left: Logo */}
        <Link to={state?"/":"/auth"} className="brand-logo" style={{position: "static", transform: "none"}}>DEVLY</Link>
        
        {/* NAYA: Hamburger Icon (Sirf mobile par dikhega) */}
        <a href="#" data-target="mobile-sidenav" className="sidenav-trigger">
          <i className="material-icons">menu</i>
        </a>

        {/* Middle: Search Bar (Sirf desktop par dikhega) */}
        {state && (
          <div className="nav-search-container">
            <i className="material-icons nav-search-icon">search</i>
            <input 
              type="text" 
              placeholder="Search users or projects..." 
              className="nav-search-input"
              value={search}
              onChange={(e)=>fetchUsers(e.target.value)}
            />
          </div>
        )}
        
        {/* Right: Links (Sirf desktop par dikhenge) */}
        <ul id="nav-mobile" className="right hide-on-med-and-down"> {/* Hide class add ki */}
          {renderList()}
        </ul>
        
        {/* Modal (Hidden) */}
        <div id="modal1" className="modal" ref={searchModal}>
          {/* ... modal code ... */}
          <div className="modal-content">
            <h4 style={{color: "#C0945D"}}>Search Results</h4>
            <ul className="collection">
              {searchResults.users.length > 0 && (
                <h5 className="collection-header">Users</h5>
              )}
              {searchResults.users.map(item => {
                  return (
                    <Link 
                      key={item._id} 
                      to={item._id !== state._id ? "/profile/" + item._id : "/profile"} 
                      onClick={()=>{
                        M.Modal.getInstance(searchModal.current).close();
                        clearSearch();
                      }}
                    >
                      <li className="collection-item avatar">
                        <img src={item.pic} alt="" className="circle" />
                        <span className="title">{item.name}</span>
                        <p>@{item.username}</p>
                      </li>
                    </Link>
                  )
              })}
              {searchResults.users.length > 0 && searchResults.posts.length > 0 && (
                <li className="collection-divider"></li>
              )}
              {searchResults.posts.length > 0 && (
                <h5 className="collection-header">Projects</h5>
              )}
              {searchResults.posts.map(item => {
                  return (
                    <Link 
                      key={item._id} 
                      to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"} 
                      onClick={()=>{
                        M.Modal.getInstance(searchModal.current).close();
                        clearSearch();
                      }}
                    >
                      <li className="collection-item">
                        <span className="title">{item.title}</span>
                        <p>by @{item.postedBy.username}</p>
                      </li>
                    </Link>
                  )
              })}
              {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                <li className="collection-item">No results found</li>
              )}
            </ul>
          </div>
          <div className="modal-footer">
            <button 
              className="modal-close waves-effect btn-flat" 
              onClick={clearSearch}
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </nav>

    {/* NAYA: Mobile Sidenav Structure */}
    <ul className="sidenav" id="mobile-sidenav" ref={sidenavRef}>
      {renderList()}
    </ul>
    </>
)
}

export default NavBar