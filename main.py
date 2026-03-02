from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, String, DateTime, Text, ForeignKey, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import bcrypt
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

DATABASE_URL = "sqlite:///./branch.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ════════════════════════════════════
# TABLES
# ════════════════════════════════════

class User(Base):
    __tablename__ = "users"
    username        = Column(String, primary_key=True)
    password        = Column(String, nullable=False)
    display_name    = Column(String, default="")
    bio             = Column(String, default="")
    avatar_url      = Column(String, default="")
    color           = Column(String, default="#c8ff00")
    text_color      = Column(String, default="#000000")
    banner_mode     = Column(String, default="solid")
    profile_bg_mode = Column(String, default="dark")
    font_family     = Column(String, default="system-ui")
    font_size       = Column(String, default="14")
    custom_css      = Column(Text,   default="")
    created_at      = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username    = Column(String, ForeignKey("users.username"), nullable=False)
    text        = Column(Text, nullable=False)
    image_url   = Column(String, default="")
    video_url   = Column(String, default="")
    created_at  = Column(DateTime, default=datetime.utcnow)

class Reply(Base):
    __tablename__ = "replies"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id     = Column(String, ForeignKey("posts.id"), nullable=False)
    username    = Column(String, ForeignKey("users.username"), nullable=False)
    text        = Column(Text, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

class Friend(Base):
    __tablename__ = "friends"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender      = Column(String, ForeignKey("users.username"), nullable=False)
    receiver    = Column(String, ForeignKey("users.username"), nullable=False)
    status      = Column(String, default="pending")
    created_at  = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ════════════════════════════════════
# MODELS
# ════════════════════════════════════

class RegisterBody(BaseModel):
    username: str
    password: str
    display_name: str = ""

class LoginBody(BaseModel):
    username: str
    password: str

class UpdateProfileBody(BaseModel):
    display_name:    str = ""
    bio:             str = ""
    color:           str = "#c8ff00"
    text_color:      str = "#000000"
    banner_mode:     str = "solid"
    profile_bg_mode: str = "dark"
    font_family:     str = "system-ui"
    font_size:       str = "14"
    custom_css:      str = ""

class CreatePostBody(BaseModel):
    username: str
    text: str

class CreateReplyBody(BaseModel):
    username: str
    text: str

class FriendRequestBody(BaseModel):
    sender: str
    receiver: str

class FriendActionBody(BaseModel):
    action: str

# ════════════════════════════════════
# AUTH
# ════════════════════════════════════

@app.post("/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user = User(username=body.username, password=hashed, display_name=body.display_name or body.username)
    db.add(user)
    db.commit()
    return {"message": "Account created", "username": user.username}

@app.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not bcrypt.checkpw(body.password.encode(), user.password.encode()):
        raise HTTPException(status_code=401, detail="Wrong password")
    return {
        "message": "Logged in", "username": user.username,
        "display_name": user.display_name, "color": user.color,
        "text_color": user.text_color, "avatar_url": user.avatar_url,
    }

# ════════════════════════════════════
# SEARCH  (NEW)
# ════════════════════════════════════

@app.get("/search/users")
def search_users(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    """Search by @username or display_name — partial, case-insensitive."""
    pattern = f"%{q}%"
    users = db.query(User).filter(
        or_(User.username.ilike(pattern), User.display_name.ilike(pattern))
    ).limit(10).all()
    return [
        {
            "username":     u.username,
            "display_name": u.display_name or u.username,
            "avatar_url":   u.avatar_url,
            "color":        u.color,
            "text_color":   u.text_color,
        }
        for u in users
    ]

# ════════════════════════════════════
# PROFILE
# ════════════════════════════════════

@app.get("/profile/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    post_count = db.query(Post).filter(Post.username == username).count()
    friend_count = db.query(Friend).filter(
        ((Friend.sender == username) | (Friend.receiver == username)),
        Friend.status == "accepted"
    ).count()
    return {
        "username": user.username, "display_name": user.display_name,
        "bio": user.bio, "avatar_url": user.avatar_url,
        "color": user.color, "text_color": user.text_color,
        "banner_mode": user.banner_mode, "profile_bg_mode": user.profile_bg_mode,
        "font_family": user.font_family, "font_size": user.font_size,
        "custom_css": user.custom_css,
        "post_count": post_count, "friend_count": friend_count,
        "joined": user.created_at.strftime("%B %Y"),
    }

@app.put("/profile/{username}")
def update_profile(username: str, body: UpdateProfileBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.display_name    = body.display_name
    user.bio             = body.bio
    user.color           = body.color
    user.text_color      = body.text_color
    user.banner_mode     = body.banner_mode
    user.profile_bg_mode = body.profile_bg_mode
    user.font_family     = body.font_family
    user.font_size       = body.font_size
    user.custom_css      = body.custom_css
    db.commit()
    return {"message": "Profile updated"}

@app.post("/profile/{username}/avatar")
def upload_avatar(username: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    ext = file.filename.split(".")[-1]
    filename = f"{username}_avatar_{uuid.uuid4().hex}.{ext}"
    path = f"uploads/{filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())
    user.avatar_url = f"/uploads/{filename}"
    db.commit()
    return {"avatar_url": user.avatar_url}

# ════════════════════════════════════
# POSTS  (username= filter added)
# ════════════════════════════════════

@app.get("/posts")
def get_posts(username: str = Query(None), db: Session = Depends(get_db)):
    q = db.query(Post).order_by(Post.created_at.desc())
    if username:
        q = q.filter(Post.username == username)
    result = []
    for p in q.all():
        user = db.query(User).filter(User.username == p.username).first()
        reply_count = db.query(Reply).filter(Reply.post_id == p.id).count()
        result.append({
            "id": p.id, "username": p.username,
            "display_name": user.display_name if user else p.username,
            "color": user.color if user else "#c8ff00",
            "text_color": user.text_color if user else "#000",
            "avatar_url": user.avatar_url if user else "",
            "text": p.text, "image_url": p.image_url, "video_url": p.video_url,
            "reply_count": reply_count,
            "created_at": p.created_at.strftime("%b %d %Y %H:%M"),
        })
    return result

@app.post("/posts")
def create_post(body: CreatePostBody, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=404, detail="User not found")
    post = Post(username=body.username, text=body.text)
    db.add(post)
    db.commit()
    return {"message": "Post created", "id": post.id}

@app.post("/posts/{post_id}/image")
def upload_post_image(post_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    ext = file.filename.split(".")[-1]
    filename = f"post_{post_id}_{uuid.uuid4().hex}.{ext}"
    path = f"uploads/{filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())
    post.image_url = f"/uploads/{filename}"
    db.commit()
    return {"image_url": post.image_url}

@app.delete("/posts/{post_id}")
def delete_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}

# ════════════════════════════════════
# REPLIES
# ════════════════════════════════════

@app.get("/posts/{post_id}/replies")
def get_replies(post_id: str, db: Session = Depends(get_db)):
    replies = db.query(Reply).filter(Reply.post_id == post_id).order_by(Reply.created_at).all()
    result = []
    for r in replies:
        user = db.query(User).filter(User.username == r.username).first()
        result.append({
            "id": r.id, "username": r.username,
            "display_name": user.display_name if user else r.username,
            "color": user.color if user else "#c8ff00",
            "text_color": user.text_color if user else "#000",
            "text": r.text, "created_at": r.created_at.strftime("%b %d %Y %H:%M"),
        })
    return result

@app.post("/posts/{post_id}/replies")
def add_reply(post_id: str, body: CreateReplyBody, db: Session = Depends(get_db)):
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")
    reply = Reply(post_id=post_id, username=body.username, text=body.text)
    db.add(reply)
    db.commit()
    return {"message": "Reply added", "id": reply.id}

# ════════════════════════════════════
# FRIENDS
# ════════════════════════════════════

@app.post("/friends/request")
def send_friend_request(body: FriendRequestBody, db: Session = Depends(get_db)):
    if body.sender == body.receiver:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    existing = db.query(Friend).filter(
        ((Friend.sender == body.sender) & (Friend.receiver == body.receiver)) |
        ((Friend.sender == body.receiver) & (Friend.receiver == body.sender))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already exists")
    db.add(Friend(sender=body.sender, receiver=body.receiver))
    db.commit()
    return {"message": "Friend request sent"}

@app.put("/friends/{request_id}")
def respond_to_request(request_id: str, body: FriendActionBody, db: Session = Depends(get_db)):
    req = db.query(Friend).filter(Friend.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if body.action not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Action must be accepted or rejected")
    req.status = body.action
    db.commit()
    return {"message": f"Request {body.action}"}

@app.get("/friends/{username}")
def get_friends(username: str, db: Session = Depends(get_db)):
    friends = db.query(Friend).filter(
        ((Friend.sender == username) | (Friend.receiver == username)),
        Friend.status == "accepted"
    ).all()
    result = []
    for f in friends:
        fn = f.receiver if f.sender == username else f.sender
        user = db.query(User).filter(User.username == fn).first()
        if user:
            result.append({
                "username": user.username, "display_name": user.display_name,
                "avatar_url": user.avatar_url, "color": user.color,
            })
    return result

@app.get("/friends/{username}/pending")
def get_pending_requests(username: str, db: Session = Depends(get_db)):
    pending = db.query(Friend).filter(Friend.receiver == username, Friend.status == "pending").all()
    result = []
    for f in pending:
        user = db.query(User).filter(User.username == f.sender).first()
        if user:
            result.append({
                "request_id": f.id, "username": user.username,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url, "color": user.color,
            })
    return result

@app.get("/")
def root():
    return {"message": "Branch API is running"}
