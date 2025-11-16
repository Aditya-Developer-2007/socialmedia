import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import { useHistory, Link } from 'react-router-dom';

const SubscribedUserPost = () => {
    const [posts, setPosts] = useState([]);
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const { state } = useContext(UserContext)
    const history = useHistory()

    useEffect(() => {
        if (!state) {
            history.push('/signin')
            return;
        }

        const fetchSubscribedPosts = async () => {
            try {
                const res = await fetch('https://devly-backend.onrender.com/api/getsubpost', {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("jwt")
                    }
                });
                const result = await res.json();
                if(result.posts){
                    setPosts(result.posts)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchSubscribedPosts();
    }, [state, history])

    const updatePostState = (updatedPost) => {
        const newPosts = posts.map(oldPost => {
            return oldPost._id === updatedPost._id ? updatedPost : oldPost;
        });
        setPosts(newPosts);
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

    return (
        <div className="home">
            {
                posts.length > 0 ?
                posts.map(post => {
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
                                {post.postedBy._id === state._id &&
                                    <i className="material-icons" onClick={() => {}}>delete</i>
                                }
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
                    <h4 style={{color: "#C0945D"}}>No projects from users you follow.</h4>
                    <p style={{color: "#E0E0E0"}}>Go to the Home page to discover and follow new users!</p>
                </div>
            }
        </div>
    );
}

export default SubscribedUserPost