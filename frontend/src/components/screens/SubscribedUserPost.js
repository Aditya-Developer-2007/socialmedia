import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import { useHistory, Link } from 'react-router-dom';

const SubscribedUserPost = () => {
    const [data, setData] = useState([]);
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const { state, dispatch } = useContext(UserContext)
    const history = useHistory()

    useEffect(() => {
        if (!state) {
            history.push('/signin')
            return;
        }
        fetch('http://localhost:5000/api/getsubpost', {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            if(result.posts){
                setData(result.posts)
            }
        })
        .catch(err => console.log(err))
    }, [])

    const ratePost = (score, postId) => {
        fetch('http://localhost:5000/api/rate', {
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
            const newData = data.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            });
            setData(newData);
        })
        .catch(err => console.log(err));
    }

    const makeComment = (text, postId) => {
        if(!text){
            return;
        }
        fetch('http://localhost:5000/api/comment', {
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
            const newData = data.map(item => {
                if (item._id === updatedPost._id) {
                    return updatedPost;
                } else {
                    return item;
                }
            })
            setData(newData)
        })
        .catch(err => console.log(err))
    }

    const deletePost = (postId) => {
        fetch(`http://localhost:5000/api/deletepost/${postId}`, {
            method: "delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            const newData = data.filter(item => {
                return item._id !== postId
            })
            setData(newData)
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

    // Comment toggle function
    const toggleComments = (postId) => {
        if (showCommentsFor === postId) {
            setShowCommentsFor(null);
        } else {
            setShowCommentsFor(postId);
        }
    }

    return (
        <div className="home">
            {
                data.length > 0 ?
                data.map(item => {
                    return (
                        <div className="card home-card" key={item._id}>
                            
                            {/* --- 1. Card Header (User Info) --- */}
                            <div className="card-header-new">
                                <img src={item.postedBy.pic} alt="user pic" />
                                <div>
                                    <Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}>
                                        {item.postedBy.name}
                                    </Link>
                                    <div className="username-subtext">({item.postedBy.username})</div>
                                </div>
                                {item.postedBy._id === state._id &&
                                    <i className="material-icons" onClick={() => deletePost(item._id)}>delete</i>
                                }
                            </div>

                            {/* --- 2. Card Image --- */}
                            <div className="card-image-new">
                                <img src={item.photo} alt={item.title} />
                            </div>

                            {/* --- 3. Card Content (Title/Body) --- */}
                            <div className="card-content-new">
                                <h5>{item.title}</h5>
                                <p>{item.body}</p>
                            </div>

                            {/* --- 4. Card Actions (Stars & Comment) --- */}
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

                            {/* --- 5. Comment Section (Toggleable) --- */}
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
                    <h4 style={{color: "#C0945D"}}>No projects from users you follow.</h4>
                    <p style={{color: "#E0E0E0"}}>Go to the Home page to discover and follow new users!</p>
                </div>
            }
        </div>
    );
}

export default SubscribedUserPost