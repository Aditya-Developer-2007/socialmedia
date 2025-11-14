import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import { UserContext } from '../../App'
import M from 'materialize-css'

const UserProfile = () => {
    const [userProfile, setUserProfile] = useState(null)
    const [showFollow, setShowFollow] = useState(true)
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const { state, dispatch } = useContext(UserContext)
    const { userId } = useParams()
    const history = useHistory()

    useEffect(() => {
        if (!state) {
            history.push('/signin')
            return;
        }
        fetch(`https://devly-backend.onrender.com/api/user/${userId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            if(result){
                setUserProfile(result)
                if (result.user && state) {
                    const amIFollowing = result.user.followers.includes(state._id)
                    setShowFollow(!amIFollowing)
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
    }, [userId, state, history])

    const followUser = () => {
        fetch('https://devly-backend.onrender.com/api/follow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: userId
            })
        })
        .then(res => res.json())
        .then(data => {
            dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } })
            localStorage.setItem("user", JSON.stringify(data))
            setUserProfile((prevState) => {
                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers: [...prevState.user.followers, data._id]
                    }
                }
            })
            setShowFollow(false)
        })
        .catch(err => console.log(err))
    }

    const unfollowUser = () => {
        fetch('https://devly-backend.onrender.com/api/unfollow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                unfollowId: userId
            })
        })
        .then(res => res.json())
        .then(data => {
            dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } })
            localStorage.setItem("user", JSON.stringify(data))
            setUserProfile((prevState) => {
                const newFollowers = prevState.user.followers.filter(item => item !== data._id)
                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers: newFollowers
                    }
                }
            })
            setShowFollow(true)
        })
        .catch(err => console.log(err))
    }

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
            const newPosts = userProfile.posts.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            });
            setUserProfile(prevState => {
                return {
                    ...prevState,
                    posts: newPosts
                }
            });
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
            const newPosts = userProfile.posts.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            });
            setUserProfile(prevState => {
                return {
                    ...prevState,
                    posts: newPosts
                }
            });
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

    if (!userProfile) {
        return <h2 style={{textAlign:"center", color:"#C0945D"}}>Loading...</h2>
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
                <div>
                    <img src={userProfile.user.pic} style={{ width: '160px', height: "160px", borderRadius: "80px" }} alt="Profile Pic"/>
                </div>
                <div>
                    <h4 style={{color:"#C0945D"}}>{userProfile.user.name}</h4>
                    <h6 style={{color:"#AAAAAA"}}>({userProfile.user.username})</h6>
                    <h6 style={{ color: "#E0E0E0", marginTop: "10px" }}>Course: {userProfile.user.course}</h6>
                    <h6 style={{ color: "#E0E0E0" }}>Semester: {userProfile.user.semester}</h6>

                    <div style={{ display: 'flex', justifyContent: "space-between", width: "108%", margin:"20px 0px" }}>
                        <h6 style={{color:"#E0E0E0"}}>{userProfile.posts.length} projects</h6>
                        <h6 style={{color:"#E0E0E0"}}>{userProfile.user.followers.length} followers</h6>
                        <h6 style={{color:"#E0E0E0"}}>{userProfile.user.following.length} following</h6>
                    </div>
                    {showFollow ?
                        <button className="btn waves-effect waves-light" onClick={() => followUser()}>Follow</button>
                        :
                        <button className="btn waves-effect waves-light red darken-3" onClick={() => unfollowUser()}>UnFollow</button>
                    }
                </div>
            </div>
            
            {/* --- Naya "Instagram-Style" Card Layout --- */}
            <div className="home" style={{padding: "0 20px", maxWidth: "650px"}}> {/* Center mein rakha hai */}
                {
                    userProfile.posts.length > 0 ?
                    userProfile.posts.map(item => {
                        return (
                            <div className="card home-card" key={item._id}>
                            
                                <div className="card-header-new">
                                    <img src={item.postedBy.pic} alt="user pic" />
                                    <div>
                                        <Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}>
                                            {item.postedBy.name}
                                        </Link>
                                        <div className="username-subtext">({item.postedBy.username})</div>
                                    </div>
                                    {/* Yahaan delete button nahi hai, kyunki yeh aapka post nahi hai */}
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
                    <div style={{textAlign: "center", marginTop: "50px"}}>
                        <h4 style={{color: "#C0945D"}}>User has not posted any projects yet.</h4>
                    </div>
                }
            </div>
        </div>
    )
}

export default UserProfile