import React, { useState,useEffect } from 'react'
import {Link, useHistory} from 'react-router-dom'
import M from 'materialize-css'

const CreatePost = () =>{
    const history = useHistory();
    const [title,setTitle] = useState("");
    const [body,setBody] = useState("");
    const [githubLink,setGithubLink] = useState("");
    const [livePreviewLink,setLivePreviewLink] = useState("");
    const [image,setImage] = useState("");
    const [url,setUrl] = useState("");

    useEffect(()=>{
        if(url){
            fetch("http://localhost:5000/api/createpost",{
                method:"post",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    title,
                    body,
                    githubLink,
                    livePreviewLink,
                    pic:url
                })
            }).then(res=>res.json())
              .then(data => {
                  if(data.error)
                M.toast({html:""+data.error,classes:"#c62828 red darken-2"})
                else{
                    M.toast({html:"Project Added successfully",classes:"#00e676 green accent-3"})
                    history.push('/')
                } 
            }).catch(err=>{
                console.log(err)
            })
        }
    },[url])

    const PostDetails = () =>{
        const data = new FormData();
        data.append("file",image);
        data.append("upload_preset","instaclone")
        data.append("cloud_name","igproject")
        fetch("https://api.cloudinary.com/v1_1/igproject/image/upload",{
            method:"post",
            body:data
        })
        .then(res=>res.json())
        .then(data => {
            setUrl(data.url)
        })
        .catch(err=>console.log(err))
    }

    return (
        <div className="card input-filled" 
        style={{
            margin:"50px auto",
            maxWidth:"500px",
            padding:"40px",
            textAlign:"center"
        }}>
            <input 
                type="text" 
                placeholder="Project Title"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="Project Description"
                value={body}
                onChange={(e)=>setBody(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="GitHub Link"
                value={githubLink}
                onChange={(e)=>setGithubLink(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="Live Preview Link (Optional)"
                value={livePreviewLink}
                onChange={(e)=>setLivePreviewLink(e.target.value)}
            />
            <div className="file-field input-field">
                <div className="btn blue darken-1">
                    <span>Upload Thumbnail</span>
                    <input 
                        type="file"
                        onChange={(e)=>setImage(e.target.files[0])}
                    />
                </div>
                <div className="file-path-wrapper">
                    <input 
                        className="file-path validate" 
                        type="text"
                    />
                </div>
            </div>
            <button
                className="btn waves-effect waves-light #0d47a1 blue darken-4" 
                onClick={()=>PostDetails()}>
                Submit Project
            </button>
        </div>
    );
}

export default CreatePost