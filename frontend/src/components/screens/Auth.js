import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../App';
import M from 'materialize-css';

const Auth = () => {
    const { state, dispatch } = useContext(UserContext);
    const history = useHistory();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [showSignInPass, setShowSignInPass] = useState(false);

    const [signUpName, setSignUpName] = useState("");
    const [signUpUsername, setSignUpUsername] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpCourse, setSignUpCourse] = useState("");
    const [signUpSemester, setSignUpSemester] = useState("");
    const [signUpImage, setSignUpImage] = useState("");
    const [signUpUrl, setSignUpUrl] = useState(undefined);
    const [showSignUpPass, setShowSignUpPass] = useState(false);

    useEffect(() => {
        if (signUpUrl) {
            uploadSignUpField();
        }
    }, [signUpUrl]);

    const uploadSignUpPic = async () => {
        const data = new FormData();
        data.append("file", signUpImage);
        data.append("upload_preset", "instaclone");
        data.append("cloud_name", "igproject");

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/igproject/image/upload", {
                method: "post",
                body: data
            });
            const result = await res.json();
            setSignUpUrl(result.url);
        } catch (err) {
            console.log(err);
        }
    };

    const uploadSignUpField = async () => {
        try {
            const res = await fetch("https://devly-backend.onrender.com/api/signup", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: signUpName,
                    username: signUpUsername,
                    password: signUpPassword,
                    email: signUpEmail,
                    course: signUpCourse,
                    semester: signUpSemester,
                    pic: signUpUrl
                })
            });
            const data = await res.json();
            if (data.error) {
                M.toast({ html: data.error, classes: '#d32f2f red darken-2' });
            } else {
                M.toast({ html: data.msg, classes: '#00e676 green accent-3' });
                setIsRightPanelActive(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        if (signUpImage) {
            uploadSignUpPic();
        } else {
            uploadSignUpField();
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://devly-backend.onrender.com/api/signin", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: signInPassword,
                    email: signInEmail
                })
            });
            const data = await res.json();
            if (data.error) {
                M.toast({ html: data.error, classes: '#d32f2f red darken-2' });
            } else {
                localStorage.setItem("jwt", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                dispatch({ type: "USER", payload: data.user });
                M.toast({ html: "User Signed In", classes: '#00e676 green accent-3' });
                history.push('/');
            }
        } catch (err) {
            console.log(err);
        }
    };


    return (
        <div className="auth-page-container">
            <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}>
                
                <div className="form-container signup-container">
                    <form className="auth-form" onSubmit={handleSignupSubmit}>
                        <h2>Create Account</h2>
                        
                        <div className="form-grid">
                            <input type="text" placeholder="Name" value={signUpName} onChange={e => setSignUpName(e.target.value)} />
                            <input type="text" placeholder="Username" value={signUpUsername} onChange={e => setSignUpUsername(e.target.value)} />
                            
                            <input type="email" placeholder="Email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className="grid-span-2" />
                            
                            <div className="password-input-container grid-span-2">
                                <input type={showSignUpPass ? "text" : "password"} placeholder="Password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} />
                                <i className="material-icons password-toggle-icon" onClick={() => setShowSignUpPass(!showSignUpPass)}>
                                    {showSignUpPass ? "visibility_off" : "visibility"}
                                </i>
                            </div>

                            <input type="text" placeholder="Course (e.g., B.Tech CSE)" value={signUpCourse} onChange={e => setSignUpCourse(e.target.value)} />
                            <input type="number" placeholder="Semester" value={signUpSemester} onChange={e => setSignUpSemester(e.target.value)} />

                            <div className="file-field input-field grid-span-2" style={{width: "100%", marginTop: "10px"}}>
                                <div className="btn">
                                    <span>Profile Pic</span>
                                    <input type="file" onChange={(e) => setSignUpImage(e.target.files[0])} />
                                </div>
                                <div className="file-path-wrapper">
                                    <input className="file-path validate" type="text" />
                                </div>
                            </div>
                        </div>

                        <button className="btn waves-effect waves-light" type="submit">Sign Up</button>
                        <span className="mobile-toggle-link" style={{display:"none"}} onClick={() => setIsRightPanelActive(false)}>
                            Already have an Account? Sign In
                        </span>
                    </form>
                </div>

                <div className="form-container signin-container">
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                        <h2>Login</h2>
                        <input type="email" placeholder="Email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} />
                        
                        <div className="password-input-container">
                            <input type={showSignInPass ? "text" : "password"} placeholder="Password" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} />
                            <i className="material-icons password-toggle-icon" onClick={() => setShowSignInPass(!showSignInPass)}>
                                {showSignInPass ? "visibility_off" : "visibility"}
                            </i>
                        </div>
                        
                        <button className="btn waves-effect waves-light" type="submit">Login</button>
                        <span className="mobile-toggle-link" style={{display:"none"}} onClick={() => setIsRightPanelActive(true)}>
                            Don't have an Account? Sign Up
                        </span>
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost-button" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start your journey with us</p>
                            <button className="ghost-button" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Auth;