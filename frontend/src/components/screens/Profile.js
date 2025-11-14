import React, { useEffect, useState, useContext, useRef } from 'react'
import { UserContext } from '../../App';
import { useHistory, Link } from 'react-router-dom';
import M from 'materialize-css'

const Profile = () => {
    const [mypics, setMyPics] = useState([])
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const history = useHistory();
    const editModal = useRef(null);

    const [updatedName, setUpdatedName] = useState("");
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedCourse, setUpdatedCourse] = useState("");
    const [updatedSemester, setUpdatedSemester] = useState("");

    useEffect(() => {
        if (!state) {
            history.push('/signin')
            return;
        }
        M.Modal.init(editModal.current);

        fetch('https://devly-backend.onrender.com/api/mypost', {
            method: "get",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            if (result.mypost) {
                setMyPics(result.mypost)
            }
        })
        .catch(err => {
            console.log(err)
        })
    }, [state, history])

    const openEditModal = () => {
        if(state){
            setUpdatedName(state.name);
            setUpdatedUsername(state.username);
            setUpdatedCourse(state.course);
            setUpdatedSemester(state.semester);
            M.Modal.getInstance(editModal.current).open();
        }
    }

    const updateProfileDetails = () => {
        fetch('https://devly-backend.onrender.com/api/update-profile', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                name: updatedName,
                username: updatedUsername,
                course: updatedCourse,
                semester: updatedSemester
            })
        }).then(res => res.json())
          .then(updatedUser => {
              if(updatedUser.error){
                  M.toast({html: updatedUser.error, classes:'#d32f2f red darken-2'})
              } else {
                  const updatedState = { ...state, ...updatedUser };
                  localStorage.setItem("user", JSON.stringify(updatedState));
                  dispatch({ type: "USER", payload: updatedState });
                  M.toast({html: "Profile updated successfully", classes:'#00e676 green accent-3'})
                  M.Modal.getInstance(editModal.current).close();
              }
          }).catch(err => {
              console.log(err);
          })
    }


    // --- Card functions (Ratings, Comments) ---
    const ratePost = (score, postId) => {
        fetch('https://devly-backend.onrender.com/api/rate', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: postId,
                score: score
            })
        })
        .then(res => res.json())
        .then(updatedPost => {
            const newData = mypics.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            });
            setMyPics(newData);
        })
        .catch(err => console.log(err));
    }
    const makeComment = (text, postId) => {
        if(!text){
            return;
        }
        fetch('https://devly-backend.onrender.com/api/comment', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId,
                text
            })
        })
        .then(res => res.json())
        .then(updatedPost => {
            const newData = mypics.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            })
            setMyPics(newData)
        })
        .catch(err => console.log(err))
    }
    const deletePost = (postId) => {
        fetch(`https://devly-backend.onrender.com/api/deletepost/${postId}`, {
            method: "delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            const newData = mypics.filter(item => {
                return item._id !== postId
            })
            setMyPics(newData)
        })
        .catch(err => console.log(err))
    }
    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) {
            return 0;
        }
        const total = ratings.reduce((acc, r) => acc + r.score, 0);
        return (total / ratings.length).toFixed(1);
    }
    const getMyRating = (ratings) => {
        if (!state || !ratings) return 0;
        const myRating = ratings.find(r => r.postedBy === state._id);
        return myRating ? myRating.score : 0;
    }
    const toggleComments = (postId) => {
        if (showCommentsFor === postId) {
            setShowCommentsFor(null);
        } else {
            setShowCommentsFor(postId);
        }
    }
    // --- End Card Functions ---


    if (!state) {
        return <h2 style={{ textAlign: "center", color: "#C0945D" }}>Loading...</h2>
    }

    return (
        <div style={{ maxWidth: "1000px", margin: "0px auto" }}> {/* Profile page thoda wide rakha hai */}
            {/* --- Profile Header --- */}
            <div style={{
                display: "flex",
                justifyContent: 'space-around',
                alignItems: "center",
                margin: "25px 0px",
                borderBottom: "1px solid #444444",
                paddingBottom: "25px",
                position: "relative"
            }}>

                <button 
                    className="btn-floating btn-small waves-effect waves-light"
                    style={{
                        position: "absolute", 
                        top: "10px", 
                        right: "30px",
                        backgroundColor: "#444444"
                    }}
                    onClick={() => openEditModal()}
                >
                    <i className="material-icons" style={{color: "#C0945D"}}>edit</i>
                </button>

                <div>
                    <img src={state.pic} style={{ width: '160px', height: "160px", borderRadius: "80px" }} alt="Profile Pic" />
                </div>
                <div>
                    <h4 style={{ color: "#C0945D" }}>{state.name}</h4>
                    <h6 style={{ color: "#AAAAAA" }}>({state.username})</h6>
                    <h6 style={{ color: "#E0E0E0", marginTop: "10px" }}>Course: {state.course}</h6>
                    <h6 style={{ color: "#E0E0E0" }}>Semester: {state.semester}</h6>
                    
                    <div style={{ display: 'flex', justifyContent: "space-between", width: "108%", margin: "20px 0px" }}>
                        <h6 style={{ color: "#E0E0E0" }}>{mypics.length} projects</h6>
                        <h6 style={{ color: "#E0E0E0" }}>{state.followers ? state.followers.length : "0"} followers</h6>
                        <h6 style={{ color: "#E0E0E0" }}>{state.following ? state.following.length : "0"} following</h6>
                    </div>
                </div>
            </div>

            {/* --- NAYA EDIT PROFILE MODAL --- */}
            <div id="editProfileModal" className="modal" ref={editModal}>
                <div className="modal-content">
                    <h4>Edit Profile</h4>
                    <input
                        type="text"
                        placeholder="Name"
                        value={updatedName}
                        onChange={e => setUpdatedName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={updatedUsername}
                        onChange={e => setUpdatedUsername(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Course (e.g., B.Tech CSE)"
                        value={updatedCourse}
                        onChange={e => setUpdatedCourse(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Semester (e.g., 1, 2)"
                        value={updatedSemester}
                        onChange={e => setUpdatedSemester(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <button className="modal-close waves-effect btn-flat" style={{marginRight:"10px"}}>Cancel</button>
                    <button 
                        className="waves-effect btn" 
                        onClick={() => updateProfileDetails()}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
            {/* --- END MODAL --- */}


            {/* --- Naya "Instagram-Style" Card Layout --- */}
            <div className="home" style={{padding: "0 20px", maxWidth: "650px"}}> {/* Center mein rakha hai */}
                {
                    mypics.length > 0 ?
                        mypics.map(item => {
                            return (
                                <div className="card home-card" key={item._id}>
                                    
                                    <div className="card-header-new">
                                        <img src={item.postedBy.pic} alt="user pic" />
                                        <div>
                                            <Link to={"/profile"}>
                                                {item.postedBy.name}
                                            </Link>
                                            <div className="username-subtext">({item.postedBy.username})</div>
                                        </div>
                                        <i className="material-icons" onClick={() => deletePost(item._id)}>delete</i>
                                    </div>

                                    <div className="card-image-new">
                                        <img src={item.photo} alt={item.title} />
                                    </div>

                                    <div className="card-content-new">
                                        <h5>{item.title}</h5>
                                        <p>{item.body}</p>
                                    </div>

                                    <div className="card-actions-new">
                                        <div className="rating-section">
                                            <div className="stars">
                                                {[...Array(5)].map((star, index) => {
                                                    const ratingValue = index + 1;
                                                    const myRating = getMyRating(item.ratings);
                                                    return (
                                                        <i 
                                                            key={index}
                                                            className="material-icons" 
                                                            onClick={() => ratePost(ratingValue, item._id)}
                                                        >
                                                            {ratingValue <= myRating ? "star" : "star_border"}
                                                        </i>
                                                    )
                                                })}
                                            </div>
                                            <span className="rating-text">
                                                Avg: {calculateAverageRating(item.ratings)} ({item.ratings.length})
                                            </span>
                                        </div>

                                        <button 
                                            onClick={() => toggleComments(item._id)} 
                                            className="btn-small waves-effect waves-light comment-button"
                                        >
                                            <i className="material-icons left" style={{margin:0, marginRight:"5px"}}>comment</i>
                                            {item.comments.length}
                                        </button>
                                    </div>

                                    {showCommentsFor === item._id && (
                                        <div className="card-comments-new">
                                            <div className="comment-list">
                                                {item.comments.length === 0 && (
                                                    <p>No comments yet.</p>
                                                )}
                                                {item.comments.map(record => (
                                                    <h6 key={record._id}>
                                                        <Link to={record.postedBy._id !== state._id ? "/profile/" + record.postedBy._id : "/profile"}>{record.postedBy.username}</Link>
                                                        <span> {record.text}</span>
                                                    </h6>
                                                ))}
                                            </div>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                makeComment(e.target[0].value, item._id)
                                                e.target[0].value = ""
                                            }}>
                                                <input type="text" placeholder="Add a Comment" style={{height:"3rem", fontSize:"1rem"}}/>
                                            </form>
                                        </div>
                                    )}

                                </div>
                            )
                        })
                        :
                        <div style={{ textAlign: "center", marginTop: "50px" }}>
                            <h4 style={{ color: "#C0945D" }}>You haven't posted any projects yet.</h4>
                            <p style={{ color: "#E0E0E0" }}>Click on "Create Project" to get started!</p>
                        </div>
                }
            </div>
        </div>
    )
}

export default Profile