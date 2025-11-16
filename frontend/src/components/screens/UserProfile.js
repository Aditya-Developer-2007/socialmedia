import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import { UserContext } from '../../App'

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

        const fetchUserProfile = async () => {
            try {
                const res = await fetch(`https://devly-backend.onrender.com/api/user/${userId}`, {
                    headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
                });
                const result = await res.json();
                
                if(result){
                    setUserProfile(result)
                    if (result.user && state) {
                        const amIFollowing = result.user.followers.includes(state._id)
                        setShowFollow(!amIFollowing)
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchUserProfile();
    }, [userId, state, history])

    const followUser = async () => {
        try {
            const res = await fetch('https://devly-backend.onrender.com/api/follow', {
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({ followId: userId })
            });
            const data = await res.json();
            
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
        } catch (err) {
            console.log(err);
        }
    }

    const unfollowUser = async () => {
        try {
            const res = await fetch('https://devly-backend.onrender.com/api/unfollow', {
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({ unfollowId: userId })
            });
            const data = await res.json();

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
        } catch (err) {
            console.log(err);
        }
    }

    const updatePostState = (updatedPost) => {
        setUserProfile(prevState => {
            const newPosts = prevState.posts.map(oldPost => {
                return oldPost._id === updatedPost._id ? updatedPost : oldPost;
            });
            return {
                ...prevState,
                posts: newPosts
            }
        });
    };

    const ratePost = async (score, postId) => {
        try {
            const res = await fetch('https://devly-backend.onrender.com/api/rate', {
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({ postId, score })
            });
            const updatedPost = await res.json();
            updatePostState(updatedPost);
        } catch (err) {
            console.log(err);
        }
    }

    const makeComment = async (text, postId, e) => {
        e.preventDefault();
        if(!text) return;
        
        try {
            const res = await fetch('https://devly-backend.onrender.com/api/comment', {
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({ postId, text })
            });
            const updatedPost = await res.json();
            updatePostState(updatedPost);
            e.target.reset();
        } catch (err) {
            console.log(err);
        }
    }

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const total = ratings.reduce((acc, r) => acc + r.score, 0);
        return (total / ratings.length).toFixed(1);
    }

    const getMyRating = (ratings) => {
        if (!state || !ratings) return 0;
        const myRating = ratings.find(r => r.postedBy._id === state._id);
        return myRating ? myRating.score : 0;
    }

    const toggleComments = (postId) => {
        setShowCommentsFor(prevPostId => prevPostId === postId ? null : postId);
    }

    if (!userProfile) {
        return <h2 style={{textAlign:"center", color:"#C0945D"}}>Loading...</h2>
    }

    return (
        <div style={{ maxWidth: "1000px", margin: "0px auto" }}>
            <div className="profile-header">
                <div>
                    <img src={userProfile.user.pic} style={{ width: '160px', height: "160px", borderRadius: "80px" }} alt="Profile Pic"/>
                </div>
                <div>
                    <h4>{userProfile.user.name}</h4>
                    <h6 style={{color:"#AAAAAA"}}>({userProfile.user.username})</h6>
                    <h6 style={{ marginTop: "10px" }}>Course: {userProfile.user.course}</h6>
                    <h6>Semester: {userProfile.user.semester}</h6>

                    <div style={{ display: 'flex', justifyContent: "space-between", gap:"20px", margin:"20px 0px" }}>
                        <h6>{userProfile.posts.length} projects</h6>
                        <h6>{userProfile.user.followers.length} followers</h6>
                        <h6>{userProfile.user.following.length} following</h6>
                    </div>
                    {showFollow ?
                        <button className="btn waves-effect waves-light" onClick={() => followUser()}>Follow</button>
                        :
                        <button className="btn waves-effect waves-light red darken-3" onClick={() => unfollowUser()}>UnFollow</button>
                    }
                </div>
            </div>
            
            <div className="home" style={{padding: "0 20px", maxWidth: "650px"}}>
                {
                    userProfile.posts.length > 0 ?
                    userProfile.posts.map(post => {
                        const myRating = getMyRating(post.ratings);
                        return (
                            <div className="card home-card" key={post._id}>
                            
                                <div className="card-header-new">
                                    <img src={post.postedBy.pic} alt="user pic" />
                                    <div>
                                        <Link to={post.postedBy._id !== state._id ? "/profile/" + post.postedBy._id : "/profile"}>
                                            {post.postedBy.name}
                                        </Link>
                                        <div className="username-subtext">({post.postedBy.username})</div>
                                    </div>
                                </div>
    
                                <div className="card-image-new">
                                    <img src={post.photo} alt={post.title} />
                                    <div className="card-image-links">
                                        {post.githubLink && (
                                            <a href={post.githubLink} target="_blank" rel="noopener noreferrer" className="image-link-btn">
                                                <i className="material-icons">code</i>
                                            </a>
                                        )}
                                        {post.livePreviewLink && (
                                            <a href={post.livePreviewLink} target="_blank" rel="noopener noreferrer" className="image-link-btn">
                                                <i className="material-icons">link</i>
                                            </a>
                                        )}
                                    </div>
                                </div>
    
                                <div className="card-content-new">
                                    <h5>{post.title}</h5>
                                    <p>{post.body}</p>
                                </div>
    
                                <div className="card-actions-new">
                                    <div className="rating-section">
                                        <div className="stars">
                                            {[...Array(5)].map((star, index) => {
                                                const ratingValue = index + 1;
                                                return (
                                                    <i 
                                                        key={index}
                                                        className="material-icons" 
                                                        onClick={() => ratePost(ratingValue, post._id)}
                                                    >
                                                        {ratingValue <= myRating ? "star" : "star_border"}
                                                    </i>
                                                )
                                            })}
                                        </div>
                                        <span className="rating-text">
                                            Avg: {calculateAverageRating(post.ratings)} ({post.ratings.length})
                                        </span>
                                    </div>
    
                                    <button 
                                        onClick={() => toggleComments(post._id)} 
                                        className="btn-small waves-effect waves-light comment-button"
                                    >
                                        <i className="material-icons left" style={{margin:0, marginRight:"5px"}}>comment</i>
                                        {post.comments.length}
                                    </button>
                                </div>
    
                                {showCommentsFor === post._id && (
                                    <div className="card-comments-new">
                                        <div className="comment-list">
                                            {post.comments.length === 0 && (<p>No comments yet.</p>)}
                                            {post.comments.map(record => (
                                                <h6 key={record._id}>
                                                    <Link to={record.postedBy._id !== state._id ? "/profile/" + record.postedBy._id : "/profile"}>{record.postedBy.username}</Link>
                                                    <span> {record.text}</span>
                                                </h6>
                                            ))}
                                        </div>
                                        <form onSubmit={(e) => makeComment(e.target[0].value, post._id, e)}>
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