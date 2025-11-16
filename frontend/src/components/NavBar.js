import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { UserContext } from '../App'
import M from 'materialize-css'

const NavBar = () => {
    const searchModal = useRef(null)
    const sidenavRef = useRef(null) // Sidenav ke liye Ref
    const { state, dispatch } = useContext(UserContext)
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
    const history = useHistory()

    const LogOut = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear()
            dispatch({ type: 'CLEAR' })
            history.push('/auth');
        }
    }

    useEffect(() => {
        // Components ko initialize karna
        let modalElems = document.querySelectorAll('.modal');
        M.Modal.init(modalElems);
        
        let sidenavElems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(sidenavElems);
    }, []) // Empty array taaki yeh ek baar hi chale

    const fetchUsers = (query) => {
        setSearch(query);
        if (!query) {
            setSearchResults({ users: [], posts: [] });
            return;
        }
        // Deploy kiya hua URL
        fetch('https://devly-backend.onrender.com/api/search-all', {
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
                if (searchModal.current) {
                    const instance = M.Modal.getInstance(searchModal.current);
                    instance.open();
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const clearSearch = () => {
        setSearch("");
        setSearchResults({ users: [], posts: [] });
    }

    // Links mein 'sidenav-close' add kiya hai taaki mobile menu click par band ho
    const renderList = () => {
        if (state) {
            return [
                <li key="home"><Link to="/" className="nav-icon-link sidenav-close"><i className="material-icons">home</i><span>Home</span></Link></li>,
                <li key="profile"><Link to="/profile" className="nav-icon-link sidenav-close"><i className="material-icons">person</i><span>Profile</span></Link></li>,
                <li key="create"><Link to="/createpost" className="nav-icon-link sidenav-close"><i className="material-icons">add_box</i><span>Create</span></Link></li>,
                <li key="following"><Link to="/myfollowingpost" className="nav-icon-link sidenav-close"><i className="material-icons">people</i><span>Following</span></Link></li>,
                <li key="logout" className="logout-li">
                    <button
                        className="btn waves-effect waves-light red darken-4"
                        onClick={() => LogOut()}
                    >
                        Logout
                    </button>
                </li>
            ]
        } else {
            return [
                <li key="auth"><Link to="/auth" className="nav-link-auth sidenav-close">Login / Signup</Link></li>
            ]
        }
    }

    return (
        <>
            <nav className="main-nav-bar">
                <div className="nav-wrapper">
                    <Link to={state ? "/" : "/auth"} className="brand-logo">DEVLY</Link>
                    
                    {/* Hamburger Icon */}
                    <a href="#" data-target="mobile-sidenav" className="sidenav-trigger">
                        <i className="material-icons">menu</i>
                    </a>

                    {/* Search Bar (Desktop) */}
                    {state && (
                        <div className="nav-search-container hide-on-med-and-down">
                            <i className="material-icons nav-search-icon">search</i>
                            <input
                                type="text"
                                placeholder="Search users or projects..."
                                className="nav-search-input"
                                value={search}
                                onChange={(e) => fetchUsers(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Desktop Links */}
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        {renderList()}
                    </ul>

                    {/* Search Modal (Hidden) */}
                    <div id="modal1" className="modal" ref={searchModal}>
                        <div className="modal-content">
                            <h4 style={{ color: "#C0945D" }}>Search Results</h4>
                            <ul className="collection">
                                {searchResults.users.length > 0 && (<h5 className="collection-header">Users</h5>)}
                                {searchResults.users.map(item => (
                                    <Link key={item._id} to={item._id !== state._id ? "/profile/" + item._id : "/profile"} onClick={() => { M.Modal.getInstance(searchModal.current).close(); clearSearch(); }}>
                                        <li className="collection-item avatar">
                                            <img src={item.pic} alt="" className="circle" />
                                            <span className="title">{item.name}</span>
                                            <p>@{item.username}</p>
                                        </li>
                                    </Link>
                                ))}
                                {searchResults.users.length > 0 && searchResults.posts.length > 0 && (<li className="collection-divider"></li>)}
                                {searchResults.posts.length > 0 && (<h5 className="collection-header">Projects</h5>)}
                                {searchResults.posts.map(item => (
                                    <Link key={item._id} to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"} onClick={() => { M.Modal.getInstance(searchModal.current).close(); clearSearch(); }}>
                                        <li className="collection-item">
                                            <span className="title">{item.title}</span>
                                            <p>by @{item.postedBy.username}</p>
                                        </li>
                                    </Link>
                                ))}
                                {searchResults.users.length === 0 && searchResults.posts.length === 0 && (<li className="collection-item">No results found</li>)}
                            </ul>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-close waves-effect btn-flat" onClick={clearSearch}>Close</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidenav Structure */}
            <ul className="sidenav" id="mobile-sidenav" ref={sidenavRef}>
                {renderList()}
            </ul>
        </>
    )
}

export default NavBar